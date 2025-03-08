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
  updateProfile: (updates: { username?: string; avatar_url?: string }) => Promise<void>;
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
      toast({
        title: 'Ошибка регистрации',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
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
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
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

  const handleUpdateProfile = async (updates: { username?: string; avatar_url?: string }) => {
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
      toast({
        title: 'Ошибка обновления профиля',
        description: error.message,
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