import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProjectList } from '@/features/projects';
import { ProjectBoard } from '@/features/projects/';
import { UserMenu } from '@/shared/components/layout';
import { useAuth } from '@/app/providers/AuthProviders';
import { Button } from '@/shared/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Dashboard Header */}
      <header className="flex-none border-b bg-background px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">TaskFlow</span>
            </Link>

            {/* Back to Projects Button (when viewing a project) */}
            {selectedProjectId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProjectId(null)}
                className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Projects</span>
              </Button>
            )}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!selectedProjectId ? (
          <ProjectList onSelectProject={setSelectedProjectId} />
        ) : (
          <ProjectBoard projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
        )}
      </main>
    </div>
  );
}
