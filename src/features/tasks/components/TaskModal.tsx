import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import type { TaskWithAssignee, TaskStatus, TaskPriority } from '@/shared/types';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/shared/types';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/use-tasks';
import { useProject } from '@/features/projects';
import { usePermissions } from '@/shared/hooks/use-permission';
import { toast } from 'sonner';
import { Loader2, Trash2, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithAssignee | null;
  projectId: string;
  defaultStatus?: TaskStatus;
}

export function TaskModal({
  open,
  onOpenChange,
  task,
  projectId,
  defaultStatus = 'todo'
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { data: project } = useProject(projectId);
  const permissions = usePermissions(projectId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isEditing = !!task;
  const canEdit = permissions.canEdit;
  const canDelete = permissions.canDelete;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssignedTo(task.assigned_to || '');
      setTags(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssignedTo('');
      setTags([]);
    }
  }, [task, defaultStatus]);

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawValues = tagInput.split(',');
      const newTags = rawValues.map((t) => t.trim()).filter((t) => t !== '' && !tags.includes(t));

      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      if (isEditing) {
        await updateTask.mutateAsync({
          id: task.id,
          projectId,
          title,
          description: description || undefined,
          status,
          priority,
          assigned_to: assignedTo || undefined,
          tags
        });
        toast.success('Task updated successfully');
      } else {
        await createTask.mutateAsync({
          project_id: projectId,
          title,
          description: description || undefined,
          status,
          priority,
          assigned_to: assignedTo || undefined,
          tags
        });
        toast.success('Task created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(isEditing ? 'Failed to update task' : 'Failed to create task');
    }
  };

  const handleDelete = async () => {
    if (!task || !canDelete) return;

    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask.mutateAsync({ id: task.id, projectId });
      toast.success('Task deleted successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending || deleteTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 w-[95vw] max-h-[95vh] overflow-hidden flex flex-col bg-card dark:bg-card rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 touch-pan-y">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                disabled={!canEdit || isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                disabled={!canEdit || isLoading}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as TaskStatus)}
                  disabled={!canEdit || isLoading}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                  disabled={!canEdit || isLoading}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type tags separated by commas and press Enter"
                disabled={!canEdit || isLoading}
              />
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-2 pr-1 py-0.5 gap-1 text-[11px]">
                    {tag}
                    <button
                      type="button"
                      disabled={!canEdit || isLoading}
                      onClick={() => removeTag(tag)}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Select
                value={assignedTo}
                onValueChange={setAssignedTo}
                disabled={!permissions.canAssignTasks || isLoading}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  {project?.members?.map((member: any) => (
                    <SelectItem key={member.profile.id} value={member.profile.id}>
                      {member.profile.full_name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEditing && canDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="mr-auto">
                {deleteTask.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {canEdit && (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Update' : 'Create'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
