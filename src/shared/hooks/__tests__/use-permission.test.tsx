import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getPermissions, usePermissions, useProjectRole } from '../use-permission';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/use-auth';
import type { UserRole } from '@/shared/types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: { from: vi.fn() }
}));

vi.mock('@/app/providers/use-auth', () => ({
  useAuth: vi.fn()
}));

// --- Unit test: pure mapping role -> permissions (inti RBAC) ---

describe('getPermissions', () => {
  it('admin mendapat semua permission', () => {
    expect(getPermissions('admin')).toEqual({
      canView: true,
      canEdit: true,
      canDelete: true,
      canManageMembers: true,
      canAssignTasks: true
    });
  });

  it('editor bisa edit & assign, tapi tidak bisa delete atau kelola member', () => {
    expect(getPermissions('editor')).toEqual({
      canView: true,
      canEdit: true,
      canDelete: false,
      canManageMembers: false,
      canAssignTasks: true
    });
  });

  it('viewer hanya bisa melihat', () => {
    expect(getPermissions('viewer')).toEqual({
      canView: true,
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canAssignTasks: false
    });
  });

  it('tanpa role (bukan member) tidak mendapat permission apa pun', () => {
    const perms = getPermissions(null);
    expect(Object.values(perms).every((v) => v === false)).toBe(true);
  });
});

// --- Integration test: hook mengambil role dari project_members ---

function mockRoleQuery(result: { data: { role: UserRole } | null; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const eqUser = vi.fn().mockReturnValue({ single });
  const eqProject = vi.fn().mockReturnValue({ eq: eqUser });
  const select = vi.fn().mockReturnValue({ eq: eqProject });
  vi.mocked(supabase.from).mockReturnValue({ select } as never);
  return { select, eqProject, eqUser };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProjectRole / usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' } } as never);
  });

  it('mengambil role user dari tabel project_members', async () => {
    const { eqProject, eqUser } = mockRoleQuery({ data: { role: 'editor' }, error: null });

    const { result } = renderHook(() => useProjectRole('project-1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.data).toBe('editor'));
    expect(supabase.from).toHaveBeenCalledWith('project_members');
    expect(eqProject).toHaveBeenCalledWith('project_id', 'project-1');
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('usePermissions memetakan role admin ke permission penuh', async () => {
    mockRoleQuery({ data: { role: 'admin' }, error: null });

    const { result } = renderHook(() => usePermissions('project-1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.canManageMembers).toBe(true));
    expect(result.current.canDelete).toBe(true);
  });

  it('sebelum role ter-load, semua permission false (fail-closed)', () => {
    mockRoleQuery({ data: { role: 'admin' }, error: null });

    const { result } = renderHook(() => usePermissions('project-1'), {
      wrapper: createWrapper()
    });

    // Snapshot render pertama, sebelum query resolve
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canView).toBe(false);
  });

  it('query error (mis. bukan member) menghasilkan permission kosong', async () => {
    mockRoleQuery({ data: null, error: { message: 'no rows' } });

    const { result } = renderHook(() => usePermissions('project-1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(supabase.from).toHaveBeenCalled());
    expect(Object.values(result.current).every((v) => v === false)).toBe(true);
  });

  it('tidak menjalankan query saat projectId undefined', () => {
    mockRoleQuery({ data: { role: 'admin' }, error: null });

    renderHook(() => useProjectRole(undefined), { wrapper: createWrapper() });

    expect(supabase.from).not.toHaveBeenCalled();
  });
});
