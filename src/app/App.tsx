import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/app/providers/AuthProviders';
import { ThemeProvider } from '@/app/providers/ThemeProviders';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/features/auth';
import { AppLayout } from '@/shared/components/layout';
import { lazyWithReload } from '@/shared/lib/lazy-with-reload';
import { Loader2 } from 'lucide-react';

// Code splitting per halaman: landing/login tidak ikut memuat dnd-kit & kanban.
// lazyWithReload: auto-reload sekali saat chunk lama hilang setelah deploy baru.
const LandingPage = lazyWithReload(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazyWithReload(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazyWithReload(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ProjectPage = lazyWithReload(() =>
  import('@/pages/ProjectPage').then((m) => ({ default: m.ProjectPage }))
);
const NotFoundPage = lazyWithReload(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

export function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                  </div>
                }>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/projects/:projectId" element={<ProjectPage />} />
                      <Route path="/projects/:projectId/tasks/:taskId" element={<ProjectPage />} />
                    </Route>
                  </Route>
                  <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
