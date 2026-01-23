import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { TaskWithAssignee, TaskStatus } from '@/shared/types';
import { useAuth } from '@/app/providers/AuthProviders';

export function useTasks(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          assignee:profiles!tasks_assigned_to_fkey(id, email, full_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, email, full_name, avatar_url)
        `
        )
        .eq('project_id', projectId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data as TaskWithAssignee[];
    },
    enabled: !!projectId
  });

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return query;
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
      priority?: 'low' | 'medium' | 'high' | 'urgent';
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
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.project_id] });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      status,
      priority,
      assigned_to,
      order,
      tags
    }: {
      id: string;
      projectId: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      assigned_to?: string;
      order?: number;
      tags?: string[];
    }) => {
      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
      if (order !== undefined) updateData.order = order;
      if (tags !== undefined) updateData.tags = tags;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
    }
  });
}
