import { RegisterForm } from '@/components/auth/RegisterForm';
import { Suspense } from 'react';

interface RegisterPageProps {
  searchParams: {
    redirectTo?: string;
  };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm redirectTo={searchParams.redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Sign Up - Fitness Tracking App',
  description: 'Create your fitness tracking account',
};
