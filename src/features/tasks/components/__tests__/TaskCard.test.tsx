import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard';
import type { TaskWithAssignee } from '@/shared/types';

function makeTask(overrides: Partial<TaskWithAssignee> = {}): TaskWithAssignee {
  return {
    id: 'task-1',
    project_id: 'project-1',
    title: 'Implement login page',
    description: 'Build the login form with validation',
    status: 'todo',
    priority: 'high',
    assigned_to: null,
    created_by: 'user-1',
    order: 0,
    tags: null,
    created_at: new Date().toISOString(),
    updated_at: null,
    ...overrides
  };
}

function renderCard(task: TaskWithAssignee) {
  return render(
    <DndContext>
      <SortableContext items={[task.id]}>
        <TaskCard task={task} />
      </SortableContext>
    </DndContext>
  );
}

describe('TaskCard', () => {
  it('menampilkan judul, deskripsi, dan priority task', () => {
    renderCard(makeTask());

    expect(screen.getByText('Implement login page')).toBeInTheDocument();
    expect(screen.getByText('Build the login form with validation')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('menampilkan maksimal 2 tag dan indikator sisa (+N)', () => {
    renderCard(makeTask({ tags: ['frontend', 'ui', 'auth'] }));

    expect(screen.getByText('#frontend')).toBeInTheDocument();
    expect(screen.getByText('#ui')).toBeInTheDocument();
    expect(screen.queryByText('#auth')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('menampilkan inisial assignee saat task di-assign', () => {
    renderCard(
      makeTask({
        assigned_to: 'user-2',
        assignee: {
          id: 'user-2',
          email: 'jane@example.com',
          full_name: 'Jane Doe',
          avatar_url: null,
          created_at: null,
          updated_at: null
        }
      })
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('tidak menampilkan deskripsi ketika null', () => {
    renderCard(makeTask({ description: null }));

    expect(
      screen.queryByText('Build the login form with validation')
    ).not.toBeInTheDocument();
  });
});
