import { supabase } from './supabase';

export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  username: string;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

// Функция для регистрации нового пользователя
export async function signUp({ email, password, username }: SignUpCredentials) {
  // Регистрация пользователя через Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    // Создание записи в таблице users с дополнительной информацией
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username,
        email,
        avatar_url: null,
      });

    if (profileError) {
      // Если не удалось создать профиль, удаляем пользователя из Auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return authData;
  }

  return authData;
}

// Функция для входа пользователя
export async function signIn({ email, password }: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Функция для выхода пользователя
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Функция для получения текущего пользователя
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;
  
  // Получаем дополнительную информацию о пользователе из таблицы users
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url')
    .eq('id', session.user.id)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: session.user.id,
    email: session.user.email!,
    username: data.username,
    avatar_url: data.avatar_url
  };
}

// Функция для обновления профиля пользователя
export async function updateProfile(userId: string, updates: { username?: string, avatar_url?: string }) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
} 