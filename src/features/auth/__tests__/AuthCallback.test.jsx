import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthCallback from '@/features/auth/pages/AuthCallback';
import { useAuthStore } from '@/stores/authStore';

const mockNavigate = vi.fn();
const mockReplaceState = vi.fn();
const mockFetchCurrentUser = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/auth/api', () => ({
  fetchCurrentUser: (...args) => mockFetchCurrentUser(...args),
  loadSupplierProfile: vi.fn().mockResolvedValue(null),
  getLoginErrorMessage: (err) => err?.message || 'Login failed',
  showSupplierLoginToast: vi.fn(),
}));

vi.mock('@/features/auth/hooks/useSupplierLogin', () => ({
  getPostLoginPath: () => '/',
}));

describe('AuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setUnauthenticated();
    mockNavigate.mockClear();
    mockReplaceState.mockClear();
    mockFetchCurrentUser.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['supplier'],
    });
  });

  function renderWithToken(token) {
    return render(
      <MemoryRouter initialEntries={[`/auth/callback?token=${token}`]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders loading state when token is present', () => {
    renderWithToken('valid-firebase-token');
    expect(screen.getByText(/Verifying your session/i)).toBeInTheDocument();
  });

  it('shows error when no token is in URL', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Authentication failed/i)).toBeInTheDocument();
    expect(screen.getByText(/No authentication token found/i)).toBeInTheDocument();
  });

  it('redirects to dashboard after successful auth', async () => {
    renderWithToken('valid-firebase-token');

    await waitFor(() => {
      expect(screen.getByText(/Authentication successful/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // The component uses setTimeout(..., 1500) before navigate()
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    }, { timeout: 10000 });
  }, 15000);

  it('updates auth store with user data on success', async () => {
    renderWithToken('valid-firebase-token');

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toBeTruthy();
    }, { timeout: 10000 });
  }, 15000);

  it('shows error state when token verification fails', async () => {
    mockFetchCurrentUser.mockRejectedValue(new Error('Invalid token'));
    renderWithToken('invalid-token');

    await waitFor(() => {
      expect(screen.getByText(/Authentication failed/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
