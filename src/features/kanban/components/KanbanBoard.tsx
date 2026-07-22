import { useState, useMemo } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import { TaskCard } from '@/features/tasks';
import type { TaskWithAssignee, TaskStatus } from '@/shared/types';
import { TASK_STATUSES, COLUMN_TITLES } from '@/shared/types';
import { useUpdateTask } from '@/features/tasks';
import { toast } from 'sonner';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: TaskWithAssignee[];
  projectId: string;
  onTaskClick: (task: TaskWithAssignee) => void;
  disabled?: boolean;
}

export function KanbanBoard({ tasks, projectId, onTaskClick, disabled }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithAssignee | null>(null);
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 15
      },
      onActivation: () => {
        if (window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
      }
    })
  );

  const columns = useMemo(() => {
    const tasksByStatus: Record<TaskStatus, TaskWithAssignee[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: []
    };

    tasks.forEach((task) => {
      tasksByStatus[task.status].push(task);
    });

    // Sort by order
    Object.keys(tasksByStatus).forEach((status) => {
      tasksByStatus[status as TaskStatus].sort((a, b) => a.order - b.order);
    });

    return TASK_STATUSES.map((status) => ({
      id: status,
      title: COLUMN_TITLES[status],
      tasks: tasksByStatus[status]
    }));
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = () => {
    // Handled by DndContext
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Lepas overlay secara sinkron — kartu di cache sudah dipindah optimistically,
    // jadi tidak perlu menunggu round-trip server
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const isOverColumn = TASK_STATUSES.includes(overId as TaskStatus);

    let newStatus: TaskStatus = activeTask.status;
    let newOrder: number = activeTask.order;

    if (isOverColumn) {
      // Dropped on a column
      newStatus = overId as TaskStatus;
      const tasksInNewColumn = columns.find((c) => c.id === newStatus)?.tasks || [];
      newOrder = tasksInNewColumn.length;
    } else {
      // Dropped on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        const tasksInColumn = columns.find((c) => c.id === newStatus)?.tasks || [];
        const overIndex = tasksInColumn.findIndex((t) => t.id === overId);
        newOrder = overIndex;
      }
    }

    // Update task status and order — fire-and-forget: UI sudah berubah via
    // optimistic patch; kalau gagal, cache di-rollback otomatis + tampilkan error
    if (newStatus !== activeTask.status || newOrder !== activeTask.order) {
      updateTask.mutate(
        {
          id: activeTask.id,
          projectId,
          status: newStatus,
          order: newOrder
        },
        {
          onError: (error) => {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
          }
        }
      );
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>
      <div className="h-full w-full overflow-x-auto touch-pan-x">
        <div className="flex gap-4 min-w-max px-1 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              onTaskClick={onTaskClick}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* dropAnimation={null}: animasi default menganimasikan overlay kembali ke
          posisi lama sebelum re-render optimistic — terlihat seperti "balik dulu" */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} disabled={disabled} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
