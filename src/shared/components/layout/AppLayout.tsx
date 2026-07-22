import { Link, Outlet, useMatch } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Layout untuk halaman ber-login (dashboard & project board):
 * header dengan logo, tombol back ke Projects (saat di dalam project), dan UserMenu.
 */
export function AppLayout() {
  const onProjectPage = useMatch('/projects/*');

  return (
    <div className="h-screen flex flex-col">
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

            {/* Back to Projects (saat berada di dalam project) */}
            {onProjectPage && (
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Projects</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
