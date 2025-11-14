import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background px-6 py-12">
      <LoginForm />
    </div>
  );
}
