import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';
import * as authUtils from '@/lib/supabase/auth-utils';
import { act, render, screen, waitFor } from '@testing-library/react';

// Mock auth utilities
jest.mock('@/lib/supabase/auth-utils', () => ({
  getCurrentSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  signOut: jest.fn(),
}));

const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>;

// Test component to access auth context
function TestComponent() {
  const { user, session, loading, signOut, refreshSession } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <button onClick={signOut} data-testid="sign-out">Sign Out</button>
      <button onClick={refreshSession} data-testid="refresh">Refresh</button>
    </div>
  );
}

describe('AuthProvider Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial loading state', () => {
    mockAuthUtils.getCurrentSession.mockResolvedValue({
      user: null,
      session: null,
      error: null,
    });

    mockAuthUtils.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('session')).toHaveTextContent('no-session');
  });

  it('should handle successful authentication', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    const mockSession = {
      user: mockUser,
      access_token: 'token-123',
      expires_at: Date.now() + 3600000,
    };

    mockAuthUtils.getCurrentSession.mockResolvedValue({
      user: mockUser,
      session: mockSession,
      error: null,
    });

    let authCallback: (event: string, session: any) => void = () => {};
    mockAuthUtils.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      } as any;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial session load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('session')).toHaveTextContent('has-session');
  });

  it('should handle authentication state changes', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    const mockSession = {
      user: mockUser,
      access_token: 'token-123',
      expires_at: Date.now() + 3600000,
    };

    mockAuthUtils.getCurrentSession.mockResolvedValue({
      user: null,
      session: null,
      error: null,
    });

    let authCallback: (event: string, session: any) => void = () => {};
    mockAuthUtils.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      } as any;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Initially no user
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');

    // Simulate sign in event
    act(() => {
      authCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });

    // Simulate sign out event
    act(() => {
      authCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });
  });

  it('should handle sign out with localStorage cleanup', async () => {
    // Set up some localStorage data
    localStorage.setItem('fitness_app_workouts_123', JSON.stringify({ id: '123' }));
    localStorage.setItem('fitness_app_sync_queue', JSON.stringify([]));
    localStorage.setItem('other_app_data', 'should-remain');

    mockAuthUtils.getCurrentSession.mockResolvedValue({
      user: null,
      session: null,
      error: null,
    });

    mockAuthUtils.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    mockAuthUtils.signOut.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Click sign out
    act(() => {
      screen.getByTestId('sign-out').click();
    });

    await waitFor(() => {
      expect(mockAuthUtils.signOut).toHaveBeenCalled();
    });

    // Check localStorage cleanup
    expect(localStorage.getItem('fitness_app_workouts_123')).toBeNull();
    expect(localStorage.getItem('fitness_app_sync_queue')).toBeNull();
    expect(localStorage.getItem('other_app_data')).toBe('should-remain');
  });

  it('should handle session refresh', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    };

    mockAuthUtils.getCurrentSession
      .mockResolvedValueOnce({
        user: null,
        session: null,
        error: null,
      })
      .mockResolvedValueOnce({
        user: mockUser,
        session: { user: mockUser } as any,
        error: null,
      });

    mockAuthUtils.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Initially no user
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');

    // Click refresh
    act(() => {
      screen.getByTestId('refresh').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    expect(mockAuthUtils.getCurrentSession).toHaveBeenCalledTimes(2);
  });

  it('should handle authentication errors gracefully', async () => {
    mockAuthUtils.getCurrentSession.mockRejectedValue(new Error('Network error'));

    mockAuthUtils.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to refresh session:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should throw error when useAuth is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockAuthUtils.getCurrentSession.mockResolvedValue({
      user: null,
      session: null,
      error: null,
    });

    mockAuthUtils.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    } as any);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
