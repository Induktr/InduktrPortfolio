import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Создать аккаунт</h1>
        <SignUpForm />
      </div>
    </div>
  );
} 