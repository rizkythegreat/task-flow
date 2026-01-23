import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useProjects } from '@/features/projects/hooks/use-project';
import { ProjectModal } from '@/features/projects';
import { Plus, Folder, Calendar, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none p-4 md:p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Projects
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Manage your collaborative projects
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="md:size-default">
            <Plus className="w-4 h-4 mr-0 md:mr-2" />
            <span className="hidden md:inline">New Project</span>
          </Button>
        </div>
      </div>

      {/* Project Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!projects || projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Folder className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No projects yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
              Create your first project to start collaborating with your team
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-border bg-card dark:bg-card dark:hover:border-primary/50"
                onClick={() => onSelectProject(project.id)}>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary shrink-0" />
                    {project.name}
                  </CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2 dark:text-slate-400">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {project.created_at &&
                      formatDistanceToNow(new Date(project.created_at), {
                        addSuffix: true
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
