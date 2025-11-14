import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background px-6 py-12">
      <RegisterForm />
    </div>
  );
}
