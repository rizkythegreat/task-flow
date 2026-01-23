import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CardContent } from '@/shared/components/ui/card';
import { TaskCard } from '@/features/tasks';
import { type TaskWithAssignee, type TaskStatus, STATUS_COLORS } from '@/shared/types';
import { cn } from '@/shared/lib/utils';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  disabled?: boolean;
}

export function KanbanColumn({ id, title, tasks, onTaskClick, disabled }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id
  });

  return (
    <div
      className={cn(
        'flex flex-col w-72 shrink-0'
        // isOver && 'bg-slate-50 ring-2 ring-blue-500'
      )}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', STATUS_COLORS[id])} />
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>
      <CardContent
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 rounded-lg p-2 transition-colors scrollbar-thin overflow-y-auto',
          isOver && 'bg-primary/5 ring-2 ring-primary/20'
        )}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              disabled={disabled}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            No tasks
          </div>
        )}
      </CardContent>
    </div>
  );
}
