import { describe, it, expect, vi } from 'vitest';
import { upsertTask, removeTask, mergeTaskRow } from '../use-tasks';
import type { Task, TaskWithAssignee } from '@/shared/types';

vi.mock('@/shared/lib/supabase', () => ({
  supabase: { from: vi.fn() }
}));

vi.mock('@/app/providers/use-auth', () => ({
  useAuth: vi.fn()
}));

function makeTask(overrides: Partial<TaskWithAssignee> = {}): TaskWithAssignee {
  return {
    id: 'task-1',
    project_id: 'project-1',
    title: 'Task title',
    description: null,
    status: 'todo',
    priority: 'medium',
    assigned_to: null,
    created_by: 'user-1',
    order: 0,
    tags: null,
    created_at: '2026-07-22T00:00:00Z',
    updated_at: null,
    assignee: null,
    ...overrides
  };
}

describe('upsertTask', () => {
  it('menambahkan task yang belum ada di list', () => {
    const list = [makeTask({ id: 'a' })];
    const result = upsertTask(list, makeTask({ id: 'b' }));

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('mengganti task yang sudah ada (idempotent untuk event ganda)', () => {
    const list = [makeTask({ id: 'a', title: 'Old' })];
    const result = upsertTask(list, makeTask({ id: 'a', title: 'New' }));

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('New');
  });

  it('tidak memutasi list asal', () => {
    const list = [makeTask({ id: 'a' })];
    upsertTask(list, makeTask({ id: 'b' }));

    expect(list).toHaveLength(1);
  });
});

describe('removeTask', () => {
  it('menghapus task berdasarkan id', () => {
    const list = [makeTask({ id: 'a' }), makeTask({ id: 'b' })];

    expect(removeTask(list, 'a').map((t) => t.id)).toEqual(['b']);
  });

  it('no-op untuk id yang tidak ada (event DELETE project lain)', () => {
    const list = [makeTask({ id: 'a' })];

    expect(removeTask(list, 'zzz')).toHaveLength(1);
  });
});

describe('mergeTaskRow', () => {
  const assignee = {
    id: 'user-2',
    email: 'jane@example.com',
    full_name: 'Jane Doe',
    avatar_url: null,
    created_at: null,
    updated_at: null
  };

  function makeRow(overrides: Partial<Task> = {}): Task {
    // Raw row dari payload realtime — tanpa relasi assignee/creator
    const row: Partial<TaskWithAssignee> = { ...makeTask(overrides) };
    delete row.assignee;
    delete row.creator;
    return row as Task;
  }

  it('merge field baru sambil mempertahankan relasi assignee di cache', () => {
    const list = [makeTask({ id: 'a', status: 'todo', assigned_to: 'user-2', assignee })];
    const result = mergeTaskRow(list, makeRow({ id: 'a', status: 'done', assigned_to: 'user-2' }));

    expect(result).not.toBeNull();
    expect(result![0].status).toBe('done');
    expect(result![0].assignee).toEqual(assignee); // relasi tidak hilang
  });

  it('return null saat task belum ada di cache (butuh single-row fetch)', () => {
    const list = [makeTask({ id: 'a' })];

    expect(mergeTaskRow(list, makeRow({ id: 'baru' }))).toBeNull();
  });

  it('return null saat assigned_to berubah (join assignee basi)', () => {
    const list = [makeTask({ id: 'a', assigned_to: 'user-2', assignee })];

    expect(mergeTaskRow(list, makeRow({ id: 'a', assigned_to: 'user-9' }))).toBeNull();
  });
});
