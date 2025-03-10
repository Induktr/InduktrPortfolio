import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase  from './supabase';
import { AuthUser, getCurrentUser, signIn as authSignIn, signOut as authSignOut, signUp as authSignUp, updateProfile as authUpdateProfile, resendConfirmationEmail as resendEmail } from './auth';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: { username?: string; avatar_url?: string | null }) => Promise<any>;
  resendConfirmationEmail: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Загружаем пользователя при инициализации
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Подписываемся на изменения состояния аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (email: string, password: string, username: string) => {
    setIsAuthenticating(true);
    try {
      const result = await authSignUp({ email, password, username });
      
      // Проверяем, нужно ли подтверждение email
      const emailConfirmationRequired = (result as any).emailConfirmationRequired || !result?.session;
      
      // Добавляем подробное логирование
      console.log('SignUp result:', {
        success: true,
        user: result.user ? 'present' : 'null',
        session: result.session ? 'present' : 'null',
        emailConfirmationRequired
      });
      
      if (emailConfirmationRequired) {
        toast({
          title: 'Регистрация успешна',
          description: 'Пожалуйста, проверьте вашу почту для подтверждения аккаунта.',
        });
      } else {
        // Если подтверждение не требуется или уже выполнено
        toast({
          title: 'Регистрация успешна',
          description: 'Вы успешно зарегистрировались в системе.',
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('SignUp error:', error);
      
      // Определяем понятное сообщение об ошибке
      let errorMessage = "Произошла ошибка при регистрации";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      // Если ошибка связана с ограничением запросов
      if (error.message?.includes('Слишком много запросов') || error.status === 429) {
        // Сообщение уже сформировано в функции signUp
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
        title: 'Ошибка регистрации',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Сбрасываем состояние загрузки
      setTimeout(() => {
        setIsAuthenticating(false);
      }, 200);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const result = await authSignIn({ email, password });
      
      // Добавляем подробное логирование
      console.log('SignIn result:', {
        success: true,
        user: result.user ? 'present' : 'null',
        session: result.session ? 'present' : 'null'
      });
      
      // Сразу устанавливаем пользователя, не дожидаясь события onAuthStateChange
      if (result.user) {
        setUser(result.user);
      }
      
      toast({
        title: 'Вход выполнен успешно',
        description: 'Добро пожаловать!',
      });
      
      return result;
    } catch (error: any) {
      console.error('SignIn error:', error);
      
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
        // Сообщение уже сформировано в функции signIn
      }
      
      // Если неверные учетные данные
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Неверный email или пароль";
      }
      
      // Если email не подтвержден - расширяем обнаружение этого состояния
      if (error.message?.toLowerCase().includes('email not confirmed') || 
          error.message?.toLowerCase().includes('email is not confirmed') ||
          error.message?.toLowerCase().includes('не подтвержден') ||
          error.message?.toLowerCase().includes('подтверждения') ||
          error.message?.toLowerCase().includes('verification') ||
          error.status === 422 ||
          (error.status === 400 && error.message?.toLowerCase().includes('email')) ||
          (error.status === 401 && error.message?.toLowerCase().includes('email'))) {
        errorMessage = `Email ${email} не подтвержден. Пожалуйста, проверьте почту и перейдите по ссылке для активации.`;
      }
      
      // Если таймаут операции
      if (error.message?.includes('Превышено время ожидания')) {
        errorMessage = "Превышено время ожидания ответа от сервера. Пожалуйста, проверьте соединение и попробуйте снова.";
      }
      
      toast({
        title: 'Ошибка входа',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Мгновенно сбрасываем состояние загрузки, убираем задержку
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      setUser(null);
      toast({
        title: 'Выход выполнен',
        description: 'Вы успешно вышли из системы.',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка выхода',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: { username?: string; avatar_url?: string | null }) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await authUpdateProfile(user.id, updates);
      setUser({
        ...user,
        username: updatedUser.username,
        avatar_url: updatedUser.avatar_url,
      });
      toast({
        title: 'Профиль обновлен',
        description: 'Ваш профиль успешно обновлен.',
      });
    } catch (error: any) {
      console.error('UpdateProfile error:', error);
      
      // Определяем понятное сообщение об ошибке
      let errorMessage = "Произошла ошибка при обновлении профиля";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      toast({
        title: 'Ошибка обновления профиля',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmationEmail = async (email: string) => {
    setIsAuthenticating(true);
    try {
      console.log(`Attempting to resend confirmation email to: ${email}`);
      const result = await resendEmail(email);
      console.log('Confirmation email resent result:', result);
      
      toast({
        title: 'Письмо отправлено',
        description: 'Письмо с подтверждением было отправлено повторно. Пожалуйста, проверьте вашу почту.',
      });
      
      return result;
    } catch (error: any) {
      console.error('ResendConfirmationEmail error:', error);
      
      // Определяем понятное сообщение об ошибке
      let errorMessage = "Произошла ошибка при отправке письма";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      // Если таймаут операции
      if (error.message?.includes('Превышено время ожидания')) {
        errorMessage = "Превышено время ожидания ответа от сервера. Пожалуйста, проверьте соединение и попробуйте снова.";
      }
      
      toast({
        title: 'Ошибка отправки письма',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Сбрасываем состояние загрузки
      setTimeout(() => {
        setIsAuthenticating(false);
      }, 200);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticating,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    resendConfirmationEmail: handleResendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 