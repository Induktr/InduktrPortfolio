import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Вход в аккаунт</h1>
        <SignInForm />
      </div>
    </div>
  );
} 