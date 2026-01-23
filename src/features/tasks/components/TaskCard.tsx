import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import type { TaskWithAssignee } from '@/shared/types';
import { PRIORITY_COLORS } from '@/shared/types';
import { Calendar, Flag, GripVertical, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface TaskCardProps {
  task: TaskWithAssignee;
  onClick?: () => void;
  disabled?: boolean;
}

export function TaskCard({ task, onClick, disabled }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn('outline-none select-none touch-auto', isDragging && 'relative z-50')}>
      <Card
        className={cn(
          'transition-all duration-200 border border-border bg-card',
          'cursor-pointer',
          'hover:border-primary/30 shadow-sm hover:shadow-md',
          'active:scale-[0.98]',
          'touch-none',
          isDragging && 'cursor-grabbing shadow-2xl scale-105 opacity-50 rotate-2',
          disabled && 'opacity-95'
        )}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
            </div>
            {!disabled && (
              <div {...attributes} {...listeners} className="p-1 cursor-grab touch-none">
                <GripVertical className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={cn(
                PRIORITY_COLORS[task.priority],
                'text-white text-[10px] px-1.5 py-0 shrink-0 capitalize border-none'
              )}>
              <Flag className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-x-2">
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {task.created_at &&
                formatDistanceToNow(new Date(task.created_at), {
                  addSuffix: true
                })}
            </div>

            {task.assignee ? (
              <Avatar className="w-6 h-6 border border-background">
                <AvatarImage src={task.assignee.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(task.assignee.full_name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
