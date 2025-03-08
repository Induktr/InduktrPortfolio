import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { AuthUser, getCurrentUser, signIn, signOut, signUp, updateProfile } from './auth';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_url?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    try {
      await signUp({ email, password, username });
      toast({
        title: 'Регистрация успешна',
        description: 'Пожалуйста, проверьте вашу почту для подтверждения аккаунта.',
      });
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
      
      toast({
        title: 'Ошибка регистрации',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Добавляем небольшую задержку перед сбросом состояния загрузки
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn({ email, password });
      toast({
        title: 'Вход выполнен успешно',
        description: 'Добро пожаловать!',
      });
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
      
      toast({
        title: 'Ошибка входа',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Добавляем небольшую задержку перед сбросом состояния загрузки
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
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
      const updatedUser = await updateProfile(user.id, updates);
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

  const value = {
    user,
    isLoading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
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