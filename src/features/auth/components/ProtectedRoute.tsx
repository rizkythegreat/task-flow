import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/use-auth';
import { Loader2 } from 'lucide-react';

/**
 * Layout route yang melindungi semua child route dari akses tanpa login.
 * Simpan lokasi asal di state agar LoginPage bisa redirect balik setelah login.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
