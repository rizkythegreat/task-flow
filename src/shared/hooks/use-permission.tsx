import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProviders';
import type { UserRole, Permissions } from '@/shared/types';

export function useProjectRole(projectId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-role', projectId, user?.id],
    queryFn: async () => {
      if (!projectId || !user) return null;

      const { data, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single<{ role: UserRole }>();

      if (error) {
        console.error('Error fetching project role:', error);
        return null;
      }

      return data?.role as UserRole | null;
    },
    enabled: !!projectId && !!user
  });
}

export function usePermissions(projectId: string | undefined): Permissions {
  const { data: role } = useProjectRole(projectId);

  const getPermissions = (role: UserRole | null): Permissions => {
    if (!role) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canAssignTasks: false
      };
    }

    switch (role) {
      case 'admin':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
          canManageMembers: true,
          canAssignTasks: true
        };
      case 'editor':
        return {
          canView: true,
          canEdit: true,
          canDelete: false,
          canManageMembers: false,
          canAssignTasks: true
        };
      case 'viewer':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
          canManageMembers: false,
          canAssignTasks: false
        };
      default:
        return {
          canView: false,
          canEdit: false,
          canDelete: false,
          canManageMembers: false,
          canAssignTasks: false
        };
    }
  };

  return getPermissions(role ?? null);
}

export function useIsAdmin(projectId: string | undefined): boolean {
  const { data: role } = useProjectRole(projectId);
  return role === 'admin';
}

export function useCanEdit(projectId: string | undefined): boolean {
  const permissions = usePermissions(projectId);
  return permissions.canEdit;
}

export function useCanDelete(projectId: string | undefined): boolean {
  const permissions = usePermissions(projectId);
  return permissions.canDelete;
}
