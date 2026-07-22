import { Navigate, useParams } from 'react-router-dom';
import { ProjectBoard } from '@/features/projects';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ProjectBoard projectId={projectId} />;
}
