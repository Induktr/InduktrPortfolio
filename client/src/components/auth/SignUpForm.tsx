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
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const { signUp, isAuthenticating } = useAuth();
  const { toast } = useToast();
  const [cooldown, setCooldown] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationStarted, setRegistrationStarted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);

  // Обработка таймера ожидания для блокировки повторных запросов
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

  // Считаем время, прошедшее с начала регистрации для отображения дополнительных сообщений
  useEffect(() => {
    if (!registrationStarted) {
      setTimeElapsed(0);
      setShowSlowConnectionMessage(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newValue = prev + 1;
        // Если прошло более 5 секунд и регистрация все еще идет, показываем сообщение о медленном соединении
        if (newValue >= 5 && !showSlowConnectionMessage) {
          setShowSlowConnectionMessage(true);
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [registrationStarted, showSlowConnectionMessage]);

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
    // Если активен таймер ожидания, не позволяем отправить форму
    if (cooldownActive) {
      toast({
        title: "Подождите",
        description: `Пожалуйста, подождите ${cooldown} секунд перед повторной попыткой`,
        variant: "destructive",
      });
      return;
    }

    setErrorMessage(null);
    setRegistrationStarted(true);
    setRegistrationSuccess(false);
    setShowSlowConnectionMessage(false);
    setTimeElapsed(0);

    try {
      console.log("Starting registration process...");
      const result = await signUp(values.email, values.password, values.username);
      
      // Проверяем, требуется ли подтверждение email
      const emailConfirmationRequired = result?.emailConfirmationRequired || !result?.session;
      
      form.reset();
      setRegistrationSuccess(true);
      setRegisteredEmail(values.email);
      
      // Показываем сообщение о необходимости подтверждения email
      if (emailConfirmationRequired) {
        toast({
          title: "Регистрация успешна",
          description: "Пожалуйста, проверьте вашу почту для подтверждения аккаунта.",
        });
      } else {
        toast({
          title: "Регистрация успешна",
          description: "Вы успешно зарегистрированы и можете начать использовать приложение.",
        });
      }
      
      setRegistrationStarted(false);
    } catch (error: any) {
      console.error('Registration error caught in form:', error);
      setRegistrationStarted(false);
      
      // Определяем понятное сообщение об ошибке
      let errorMessage = "Произошла ошибка при регистрации";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      setErrorMessage(errorMessage);
      
      // Если ошибка связана с ограничением запросов
      if (error.message?.includes('Слишком много запросов') || error.status === 429) {
        const waitTimeMatch = error.message.match(/подождите (\d+) секунд/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 20;
        
        setCooldown(waitTime);
        setCooldownActive(true);
      }
      
      // Если email уже используется
      if (error.message?.includes('email already exists')) {
        errorMessage = "Этот email уже зарегистрирован. Пожалуйста, используйте другой email или войдите в систему.";
      }
      
      // Если таймаут операции
      if (error.message?.includes('Превышено время ожидания')) {
        errorMessage = "Превышено время ожидания ответа от сервера. Пожалуйста, проверьте соединение и попробуйте снова.";
      }
      
      toast({
        title: "Ошибка регистрации",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Состояние кнопки
  const isButtonDisabled = isAuthenticating || cooldownActive || registrationStarted;
  const buttonText = registrationStarted ? 
                     (timeElapsed > 10 ? "Пытаемся зарегистрировать..." : 
                      timeElapsed > 5 ? "Ожидание ответа..." : "Регистрация...") : 
                     isAuthenticating ? "Обработка..." : 
                     "Зарегистрироваться";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>
          Создайте аккаунт для доступа к сервису
        </CardDescription>
        {cooldownActive && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-1">
              Пожалуйста, подождите {cooldown} секунд перед повторной попыткой
            </p>
            <Progress value={(cooldown / 20) * 100} className="h-2" />
          </div>
        )}
        {registrationStarted && timeElapsed > 0 && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-1">
              Время ожидания: {timeElapsed} сек.
            </p>
            <Progress value={Math.min(100, (timeElapsed / 15) * 100)} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {showSlowConnectionMessage && registrationStarted && (
          <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/50">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Медленное соединение</AlertTitle>
            <AlertDescription>
              Регистрация занимает больше времени, чем обычно. Пожалуйста, не закрывайте страницу.
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {registrationSuccess && (
          <Alert className="mb-4 bg-green-500/10 border-green-500/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Регистрация успешна!</AlertTitle>
            <AlertDescription>
              <p>Мы отправили письмо с подтверждением на <strong>{registeredEmail}</strong></p>
              <p className="mt-2">Пожалуйста, проверьте вашу электронную почту (включая папку "Спам") и перейдите по ссылке для активации аккаунта.</p>
              <p className="mt-2">После подтверждения email вы сможете войти в систему.</p>
            </AlertDescription>
          </Alert>
        )}
        
        {!registrationSuccess && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} disabled={isButtonDisabled} />
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
                      <Input type="email" placeholder="example@mail.com" {...field} disabled={isButtonDisabled} />
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
                      <Input type="password" placeholder="******" {...field} disabled={isButtonDisabled} />
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
                      <Input type="password" placeholder="******" {...field} disabled={isButtonDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isButtonDisabled}>
                {isButtonDisabled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {buttonText}
                  </>
                ) : buttonText}
              </Button>
            </form>
          </Form>
        )}
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