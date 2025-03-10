import { logWithTimestamp } from './logger';
import supabase from './supabase';

export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
};

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

// Константы для удобства
const API_BASE_URL = '/api';
const AUTH_ENDPOINTS = {
  SIGN_UP: `${API_BASE_URL}/auth/signup`,
  SIGN_IN: `${API_BASE_URL}/auth/signin`,
  ME: `${API_BASE_URL}/auth/me`
};

// Искусственная задержка для лучшего UX
const ARTIFICIAL_DELAY = 500;

// Функция для управления таймаутами
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Превышено время ожидания (${timeoutMs / 1000}с) при выполнении операции ${operationName}`));
    }, timeoutMs);

    promise
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Проверка текущего пользователя через серверный API-эндпоинт
export async function getCurrentUser() {
  try {
    logWithTimestamp('info', 'Getting current user');
    
    // Получаем текущую сессию из локального хранилища
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      logWithTimestamp('info', 'No active session found');
      return null;
    }
    
    // Используем серверный API-эндпоинт для проверки пользователя
    const response = await fetch(AUTH_ENDPOINTS.ME, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      logWithTimestamp('warn', `Error getting current user: ${errorData.message}`, errorData);
      
      // Для ошибок аутентификации, очищаем локальную сессию
      if (response.status === 401) {
        await supabase.auth.signOut();
      }
      
      return null;
    }
    
    const data = await response.json();
    logWithTimestamp('info', 'Current user fetched successfully');
    
    return data.user;
  } catch (error) {
    logWithTimestamp('error', 'Exception during getCurrentUser:', error);
    return null;
  }
}

// Функция для регистрации нового пользователя через серверный API-эндпоинт
export async function signUp({ email, password, username }: SignUpCredentials) {
  let startTime = Date.now();
  logWithTimestamp('info', `Starting signup process for email: ${email}, username: ${username}`);
  
  try {
    // Используем серверный API-эндпоинт для регистрации
    const response = await fetch(AUTH_ENDPOINTS.SIGN_UP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, username })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      logWithTimestamp('error', `Error during server signup: ${data.message}`, data);
      throw new Error(data.message || 'Error during registration');
    }
    
    logWithTimestamp('info', `Signup completed in ${Date.now() - startTime}ms with status: ${response.status}`);
    logWithTimestamp('info', 'Signup response:', data);
    
    // Если регистрация успешна, устанавливаем сессию в Supabase клиенте
    if (data.success && data.session) {
      const { session } = data;
      
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      
      logWithTimestamp('info', 'Session set in Supabase client');
    }
    
    // Делаем искусственную задержку для лучшего UX
    if (Date.now() - startTime < ARTIFICIAL_DELAY) {
      await new Promise(resolve => setTimeout(resolve, ARTIFICIAL_DELAY - (Date.now() - startTime)));
    }
    
    logWithTimestamp('info', 'SignUp process completed successfully');
    logWithTimestamp('info', `Final auth data to be returned: ${JSON.stringify({
      user: data.user ? 'present' : 'null',
      session: data.session ? 'present' : 'null',
      emailConfirmationRequired: data.emailConfirmationRequired
    })}`);
    
    return data;
  } catch (error) {
    logWithTimestamp('error', 'SignUp process failed with exception:', error);
    throw error;
  }
}

// Функция для входа пользователя через серверный API-эндпоинт
export async function signIn({ email, password }: SignInCredentials) {
  const startTime = Date.now();
  logWithTimestamp('info', `Starting signin process for email: ${email}`);
  
  try {
    // Используем серверный API-эндпоинт для входа
    const response = await fetch(AUTH_ENDPOINTS.SIGN_IN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      logWithTimestamp('error', `Auth error during signin: ${data.message}`, data);
      throw new Error(data.message || 'Authentication failed');
    }
    
    logWithTimestamp('info', `Auth signIn completed in ${Date.now() - startTime}ms with status: success`);
    
    // Если вход успешен, устанавливаем сессию в Supabase клиенте
    if (data.success && data.session) {
      const { session } = data;
      
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      
      logWithTimestamp('info', 'Session set in Supabase client');
    }
    
    // Делаем искусственную задержку для лучшего UX
    if (Date.now() - startTime < ARTIFICIAL_DELAY) {
      await new Promise(resolve => setTimeout(resolve, ARTIFICIAL_DELAY - (Date.now() - startTime)));
    }
    
    return data;
  } catch (error) {
    logWithTimestamp('error', 'SignIn process failed with exception:', error);
    throw error;
  }
}

// Функция для выхода пользователя
export async function signOut() {
  try {
    logWithTimestamp('info', 'Signing out user');
    
    // Используем Supabase для выхода
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logWithTimestamp('error', 'Error during signout:', error);
      throw error;
    }
    
    logWithTimestamp('info', 'User signed out successfully');
    return true;
  } catch (error) {
    logWithTimestamp('error', 'Exception during signout:', error);
    return false;
  }
}

// Функция для обновления профиля пользователя
export async function updateProfile(userId: string, updates: { username?: string, avatar_url?: string | null }) {
  try {
    // Проверяем, что пользователь существует
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user:", userError);
      throw new Error("Пользователь не найден");
    }
    
    // Обновляем профиль пользователя
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    
    // Обновляем метаданные пользователя в Auth
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        username: updates.username,
        avatar_url: updates.avatar_url
      }
    });
    
    if (metadataError) {
      console.error("Error updating user metadata:", metadataError);
      // Не выбрасываем ошибку, так как обновление профиля уже выполнено
    }
    
    return data;
  } catch (error) {
    console.error("UpdateProfile error:", error);
    throw error;
  }
}

// Функция для повторной отправки письма подтверждения email
export async function resendConfirmationEmail(email: string) {
  logWithTimestamp('info', `Resending confirmation email to: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      logWithTimestamp('error', 'Error resending confirmation email:', error);
      throw error;
    }
    
    logWithTimestamp('info', 'Confirmation email resent successfully');
    return data;
  } catch (error) {
    logWithTimestamp('error', 'Exception resending confirmation email:', error);
    throw error;
  }
} 