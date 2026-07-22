import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/features/auth';
import { useAuth } from '@/app/providers/use-auth';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  const currentMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  // Kembali ke halaman asal (di-set oleh ProtectedRoute), default ke dashboard
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <AuthForm key={currentMode} initialMode={currentMode} />
    </div>
  );
}
