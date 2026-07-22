import { useNavigate } from 'react-router-dom';
import { ProjectList } from '@/features/projects';

export function DashboardPage() {
  const navigate = useNavigate();

  return <ProjectList onSelectProject={(projectId) => navigate(`/projects/${projectId}`)} />;
}
