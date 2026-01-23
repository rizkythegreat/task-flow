import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import type { Project, ProjectWithMembers } from '@/shared/types';
import { useAuth } from '@/app/providers/AuthProviders';

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('project_members')
        .select(
          `
          project_id,
          projects (
            id,
            name,
            description,
            owner_id,
            created_at,
            updated_at,
            owner:profiles!projects_owner_id_fkey(id, email, full_name, avatar_url)
          )
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((item) => item.projects).filter(Boolean) as Project[];
    },
    enabled: !!user
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-projects:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

export function useProject(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          owner:profiles!projects_owner_id_fkey(id, email, full_name, avatar_url),
          members:project_members(
            id, role,
            profile:profiles(id, email, full_name, avatar_url)
          )
        `
        )
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as ProjectWithMembers;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5
  });

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project_detail:${projectId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => {
          queryClient.setQueryData(['project', projectId], (oldData: any) => {
            if (!oldData) return oldData;
            return { ...oldData, ...payload.new };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return query;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: { name: string; description?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          owner_id: user.id
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      const { error: memberError } = await supabase.from('project_members').upsert(
        {
          project_id: data.id,
          user_id: user.id,
          role: 'admin'
        },
        {
          onConflict: 'project_id,user_id',
          ignoreDuplicates: false
        }
      );

      if (memberError) {
        console.error('Error adding project member:', memberError);
        throw memberError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}
