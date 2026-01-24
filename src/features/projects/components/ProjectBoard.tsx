import { useState } from 'react';
import { KanbanBoard } from '@/features/kanban';
import { UserPresence } from '@/features/presence';
import { MembersModal } from '@/features/members/';
import { Button } from '@/shared/components/ui/button';
import { TaskDetail, TaskModal, useTasks } from '@/features/tasks/';
import { useProject } from '../hooks/use-project';
import { usePermissions, useProjectRole } from '@/shared/hooks/use-permission';
import type { TaskWithAssignee } from '@/shared/types';
import { Plus, Users, Loader2 } from 'lucide-react';

interface ProjectBoardProps {
  projectId: string;
  onBack?: () => void;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { isLoading: roleLoading } = useProjectRole(projectId);
  const permissions = usePermissions(projectId);

  const handleTaskClick = (task: TaskWithAssignee) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: TaskWithAssignee) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(false);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  if (tasksLoading || projectLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none flex flex-col gap-3 md:flex-row md:items-center justify-between p-4 md:p-6 border-b bg-background">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <UserPresence projectId={projectId} />
          {permissions.canEdit && (
            <Button onClick={handleCreateTask} size="sm" className="md:size-default">
              <Plus className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setIsMembersModalOpen(true)}
            size="sm"
            className="md:size-default">
            <Users className="w-4 h-4 mr-0 md:mr-2" />
            <span className="hidden sm:inline">Members</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="h-full min-w-max p-4 md:p-6">
            <KanbanBoard
              tasks={tasks || []}
              projectId={projectId}
              onTaskClick={handleTaskClick}
              disabled={!permissions.canEdit}
            />
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={handleCloseTaskModal}
        task={selectedTask}
        projectId={projectId}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          open={isTaskDetailOpen}
          onOpenChange={handleCloseTaskDetail}
          task={selectedTask}
          projectId={projectId}
          onEdit={handleEditTask}
        />
      )}

      {/* Members Modal */}
      <MembersModal
        open={isMembersModalOpen}
        onOpenChange={setIsMembersModalOpen}
        projectId={projectId}
      />
    </div>
  );
}
