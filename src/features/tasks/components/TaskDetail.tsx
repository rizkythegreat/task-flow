import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { TaskModal } from './TaskModal';
import { useDeleteTask } from '../hooks/use-tasks';
import { usePermissions } from '@/shared/hooks/use-permission';
import type { TaskWithAssignee } from '@/shared/types';
import { PRIORITY_COLORS, COLUMN_TITLES } from '@/shared/types';
import {
  Calendar,
  User,
  Flag,
  Edit,
  Trash2,
  Clock,
  Tag,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

interface TaskDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithAssignee | null;
  projectId: string;
  onEdit?: (task: TaskWithAssignee) => void;
}

export function TaskDetail({ open, onOpenChange, task, projectId }: TaskDetailProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const deleteTask = useDeleteTask();
  const permissions = usePermissions(projectId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = () => {
    if (!task) return;
    setIsDropdownOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask.mutateAsync({ id: task.id, projectId });
      toast.success('Task deleted successfully');
      setIsDropdownOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  if (!task) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-150 max-h-[85vh] overflow-y-auto bg-card dark:bg-card rounded-lg">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl font-semibold leading-tight pr-8">
                {task?.title}
              </DialogTitle>
              {(permissions.canEdit || permissions.canDelete) && (
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 mr-8 cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {permissions.canEdit && (
                      <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                    )}
                    {permissions.canDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Status & Priority */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="capitalize">
                  {COLUMN_TITLES[task?.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <Badge
                  className={cn(
                    PRIORITY_COLORS[task?.priority],
                    'text-white capitalize border-none'
                  )}>
                  {task?.priority}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {task?.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                  {task.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {task?.tags && task.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2 pl-6">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Assignee */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignee
              </h3>
              <div className="pl-6">
                {task?.assignee ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignee.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(task.assignee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{task.assignee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </div>
            </div>

            {/* Created By */}
            {task?.creator && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Created By
                </h3>
                <div className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.creator.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(task.creator.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{task.creator.full_name}</p>
                      <p className="text-xs text-muted-foreground">{task.creator.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="space-y-3 pt-4 border-t">
              {task?.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{format(new Date(task.created_at), 'PPP')}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatDistanceToNow(new Date(task.created_at), { addSuffix: true })})
                  </span>
                </div>
              )}
              {task?.updated_at && task.updated_at !== task.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{format(new Date(task.updated_at), 'PPP')}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })})
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <TaskModal
        open={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        task={task}
        projectId={projectId}
      />
    </>
  );
}
