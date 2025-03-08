import { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const { signIn, isLoading } = useAuth();
  const { toast } = useToast();
  const [cooldown, setCooldown] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Обработка таймера ожидания
  useEffect(() => {
    if (cooldown <= 0) {
      setCooldownActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const onSubmit = async (values: SignInFormValues) => {
    // Если активен таймер ожидания, не позволяем отправить форму
    if (cooldownActive) {
      toast({
        title: "Подождите",
        description: `Пожалуйста, подождите ${cooldown} секунд перед повторной попыткой`,
        variant: "destructive",
      });
      return;
    }

    try {
      await signIn(values.email, values.password);
      form.reset();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Определяем понятное сообщение об ошибке
      let errorMessage = "Произошла ошибка при входе";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      // Если ошибка связана с ограничением запросов
      if (error.message?.includes('Слишком много запросов') || error.status === 429) {
        const waitTimeMatch = error.message.match(/подождите (\d+) секунд/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 20;
        
        setCooldown(waitTime);
        setCooldownActive(true);
      }
      
      // Если неверные учетные данные
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Неверный email или пароль";
      }
      
      toast({
        title: "Ошибка входа",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>
          Войдите в свой аккаунт
        </CardDescription>
        {cooldownActive && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-1">
              Пожалуйста, подождите {cooldown} секунд перед повторной попыткой
            </p>
            <Progress value={(cooldown / 20) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isLoading || cooldownActive}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : 'Войти'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 