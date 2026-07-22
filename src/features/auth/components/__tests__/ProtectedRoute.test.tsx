import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '@/app/providers/use-auth';

vi.mock('@/app/providers/use-auth', () => ({
  useAuth: vi.fn()
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          <Route path="/projects/:projectId" element={<div>Project Board</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirect ke /login saat tidak ada user', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as never);

    renderAt('/dashboard');

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('menampilkan loading spinner selama sesi diperiksa (bukan redirect)', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true } as never);

    renderAt('/dashboard');

    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('merender child route saat user ter-autentikasi', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' }, loading: false } as never);

    renderAt('/dashboard');

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('melindungi deep link project juga', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as never);

    renderAt('/projects/project-1');

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Project Board')).not.toBeInTheDocument();
  });
});
