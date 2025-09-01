import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm redirectTo={params.redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Sign In - Fitness Tracking App',
  description: 'Sign in to your fitness tracking account',
};
