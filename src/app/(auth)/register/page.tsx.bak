import { RegisterForm } from '@/components/auth/RegisterForm';
import { Suspense } from 'react';

interface RegisterPageProps {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm redirectTo={params.redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Sign Up - Fitness Tracking App',
  description: 'Create your fitness tracking account',
};
