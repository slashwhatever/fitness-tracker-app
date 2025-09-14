import type { Session, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext } from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Mock user data for Storybook
const mockUser: User = {
  id: "test-user-id",
  aud: "authenticated",
  role: "authenticated",
  email: "test@example.com",
  email_confirmed_at: new Date().toISOString(),
  phone: "",
  confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    display_name: "Test User",
  },
  identities: [],
  factors: [],
};

// Mock session data for Storybook
const mockSession: Session = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: mockUser,
};

// Create the same context structure as the real AuthProvider
const MockAuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock auth context values
const mockAuthContext: AuthContextType = {
  user: mockUser,
  session: mockSession,
  loading: false,
  signOut: async () => {
    console.log("Mock signOut called");
  },
  refreshSession: async () => {
    console.log("Mock refreshSession called");
  },
};

// Mock AuthProvider component for Storybook
export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MockAuthContext.Provider value={mockAuthContext}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Mock useAuth hook that components can use
export function useAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a MockAuthProvider");
  }
  return context;
}

// For testing purposes, export the mock values
export { mockAuthContext, mockSession, mockUser };
