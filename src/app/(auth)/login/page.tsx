import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

interface LoginPageProps {
  searchParams: {
    redirectTo?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm redirectTo={searchParams.redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Sign In - Fitness Tracking App',
  description: 'Sign in to your fitness tracking account',
};
