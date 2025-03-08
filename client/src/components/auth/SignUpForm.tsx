import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { useToast } from '@/components/ui/use-toast';

const signUpSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.username);
      form.reset();
      toast({
        title: "Регистрация успешна",
        description: "Пожалуйста, проверьте вашу почту для подтверждения аккаунта.",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Определяем понятное сообщение об ошибке
      let errorMessage = "Произошла ошибка при регистрации";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      // Если ошибка связана с политикой безопасности
      if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
        errorMessage = "Ошибка создания профиля пользователя. Пожалуйста, попробуйте позже.";
      }
      
      // Если email уже используется
      if (error.message?.includes('email already exists')) {
        errorMessage = "Этот email уже зарегистрирован. Пожалуйста, используйте другой email или войдите в систему.";
      }
      
      toast({
        title: "Ошибка регистрации",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>
          Создайте аккаунт для доступа к сервису
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя пользователя</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтверждение пароля</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/signin" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 