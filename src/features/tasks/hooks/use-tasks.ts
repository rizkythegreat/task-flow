import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { Task, TaskWithAssignee, TaskStatus, TaskPriority, Updates } from '@/shared/types';
import { useAuth } from '@/app/providers/use-auth';

const TASK_WITH_RELATIONS = `
  *,
  assignee:profiles!tasks_assigned_to_fkey(id, email, full_name, avatar_url),
  creator:profiles!tasks_created_by_fkey(id, email, full_name, avatar_url)
`;

/** Ambil satu task lengkap dengan relasi — dipakai saat join di cache tidak bisa dipertahankan */
async function fetchTaskWithRelations(taskId: string): Promise<TaskWithAssignee | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_WITH_RELATIONS)
    .eq('id', taskId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching task:', error);
    return null;
  }
  return data as TaskWithAssignee | null;
}

// --- Pure cache helpers (di-export untuk unit test) ---

/** Tambahkan task baru, atau ganti seluruhnya jika sudah ada (idempotent) */
export function upsertTask(list: TaskWithAssignee[], task: TaskWithAssignee): TaskWithAssignee[] {
  if (list.some((t) => t.id === task.id)) {
    return list.map((t) => (t.id === task.id ? task : t));
  }
  return [...list, task];
}

/** Hapus task dari list (no-op jika tidak ada) */
export function removeTask(list: TaskWithAssignee[], taskId: string): TaskWithAssignee[] {
  return list.filter((t) => t.id !== taskId);
}

/**
 * Merge raw row (payload realtime UPDATE) ke list sambil mempertahankan relasi
 * assignee/creator yang sudah ada di cache.
 * Return null jika merge tidak aman — task belum ada di cache, atau assigned_to
 * berubah sehingga join assignee jadi basi — caller harus refetch single row.
 */
export function mergeTaskRow(list: TaskWithAssignee[], row: Task): TaskWithAssignee[] | null {
  const existing = list.find((t) => t.id === row.id);
  if (!existing) return null;
  if (existing.assigned_to !== row.assigned_to) return null;
  return list.map((t) => (t.id === row.id ? { ...t, ...row } : t));
}

export function useTasks(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(TASK_WITH_RELATIONS)
        .eq('project_id', projectId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data as TaskWithAssignee[];
    },
    enabled: !!projectId
  });

  // Real-time: patch cache per-event dari payload, BUKAN invalidate seluruh list.
  // Satu row berubah = maksimal satu single-row fetch per client, bukan refetch
  // seluruh board oleh semua user yang online (thundering herd).
  useEffect(() => {
    if (!projectId) return;

    const queryKey = ['tasks', projectId];

    const upsertFromServer = async (taskId: string) => {
      const task = await fetchTaskWithRelations(taskId);
      if (!task) return;
      queryClient.setQueryData<TaskWithAssignee[]>(queryKey, (old) =>
        old ? upsertTask(old, task) : old
      );
    };

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        (payload) => {
          // Payload tidak membawa join assignee/creator — ambil satu row lengkap
          void upsertFromServer((payload.new as Task).id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        (payload) => {
          const row = payload.new as Task;
          const current = queryClient.getQueryData<TaskWithAssignee[]>(queryKey);
          if (!current) return;

          const merged = mergeTaskRow(current, row);
          if (merged) {
            queryClient.setQueryData(queryKey, merged);
          } else {
            void upsertFromServer(row.id);
          }
        }
      )
      .on(
        'postgres_changes',
        // DELETE tanpa filter: payload.old hanya berisi primary key (replica identity),
        // jadi filter project_id tidak akan match. removeTask no-op untuk id asing.
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          queryClient.setQueryData<TaskWithAssignee[]>(queryKey, (old) =>
            old ? removeTask(old, deletedId) : old
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return query;
}

interface UpdateTaskVariables {
  id: string;
  projectId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  order?: number;
  tags?: string[];
}

/** Hanya field yang terdefinisi yang ikut di-update / di-patch optimistically */
function buildTaskUpdate(vars: UpdateTaskVariables): Updates<'tasks'> {
  const updateData: Updates<'tasks'> = {};

  if (vars.title !== undefined) updateData.title = vars.title;
  if (vars.description !== undefined) updateData.description = vars.description;
  if (vars.status !== undefined) updateData.status = vars.status;
  if (vars.priority !== undefined) updateData.priority = vars.priority;
  if (vars.assigned_to !== undefined) updateData.assigned_to = vars.assigned_to;
  if (vars.order !== undefined) updateData.order = vars.order;
  if (vars.tags !== undefined) updateData.tags = vars.tags;

  return updateData;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: {
      project_id: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigned_to?: string;
      tags?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_by: user.id,
          tags: task.tags || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      // Patch cache dengan row lengkap (join relasi), tanpa refetch seluruh list
      const task = await fetchTaskWithRelations(data.id);
      if (!task) return;
      queryClient.setQueryData<TaskWithAssignee[]>(['tasks', variables.project_id], (old) =>
        old ? upsertTask(old, task) : old
      );
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: UpdateTaskVariables) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(buildTaskUpdate(vars))
        .eq('id', vars.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update: UI (drag & drop) langsung berubah tanpa menunggu round-trip
    onMutate: async (vars) => {
      const queryKey = ['tasks', vars.projectId];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<TaskWithAssignee[]>(queryKey);
      const patch = buildTaskUpdate(vars);

      queryClient.setQueryData<TaskWithAssignee[]>(queryKey, (old) =>
        old?.map((t) => (t.id === vars.id ? { ...t, ...patch } : t))
      );

      return { previous };
    },
    onError: (_error, vars, context) => {
      // Rollback ke snapshot sebelum optimistic patch
      if (context?.previous) {
        queryClient.setQueryData(['tasks', vars.projectId], context.previous);
      }
    },
    onSuccess: async (_data, vars) => {
      // Optimistic patch hanya mengubah assigned_to (id) — join assignee ikut basi.
      // Ambil satu row lengkap agar avatar/nama assignee di UI benar.
      if (vars.assigned_to !== undefined) {
        const task = await fetchTaskWithRelations(vars.id);
        if (!task) return;
        queryClient.setQueryData<TaskWithAssignee[]>(['tasks', vars.projectId], (old) =>
          old ? upsertTask(old, task) : old
        );
      }
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<TaskWithAssignee[]>(['tasks', variables.projectId], (old) =>
        old ? removeTask(old, variables.id) : old
      );
    }
  });
}
