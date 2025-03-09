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
  try {
    console.log('Attempting to sign up user:', { email, username });
    
    // Регистрация пользователя через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) {
      console.error('Auth error during signup:', authError);
      
      // Проверяем, является ли ошибка ограничением запросов (429)
      if (authError.status === 429) {
        const waitTimeMatch = authError.message.match(/after (\d+) seconds/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 20;
        
        throw new Error(`Слишком много запросов. Пожалуйста, подождите ${waitTime} секунд перед повторной попыткой.`);
      }
      
      // Если ошибка связана с задержкой сети
      if (authError.message?.includes('NetworkError') || authError.message?.includes('network') || authError.message?.includes('timeout')) {
        throw new Error(`Проблема с сетью. Пожалуйста, проверьте подключение и попробуйте снова.`);
      }
      
      throw authError;
    }

    console.log('Auth data after signup:', authData);

    if (!authData.user) {
      console.error('No user data returned from signup');
      throw new Error('Ошибка регистрации: не удалось создать пользователя');
    }

    if (authData.user) {
      try {
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
          console.error("Error creating user profile:", profileError);
          // Не удаляем пользователя из Auth, так как у нас нет прав администратора
          
          // Если это ошибка дублирования записи, возможно пользователь уже существует
          if (profileError.code === '23505') { // PostgreSQL уникальный индекс нарушен
            console.log('User profile likely already exists, continuing...');
          } else {
            throw profileError;
          }
        }
      } catch (profileError) {
        console.error('Error during user profile creation:', profileError);
        // Продолжаем выполнение, так как аутентификация прошла успешно
      }

      // Добавляем искусственную задержку для улучшения UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Signup successful, returning auth data');
      return authData;
    }

    // Добавляем искусственную задержку для улучшения UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Signup process completed');
    return authData;
  } catch (error) {
    console.error("SignUp error:", error);
    throw error;
  }
}

// Функция для входа пользователя
export async function signIn({ email, password }: SignInCredentials) {
  try {
    console.log('Attempting to sign in user:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth error during signin:', error);
      
      // Проверяем, является ли ошибка ограничением запросов (429)
      if (error.status === 429) {
        const waitTimeMatch = error.message.match(/after (\d+) seconds/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 20;
        
        throw new Error(`Слишком много запросов. Пожалуйста, подождите ${waitTime} секунд перед повторной попыткой.`);
      }
      
      // Проверяем, является ли ошибка неверными учетными данными
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Неверный email или пароль');
      }
      
      // Если ошибка связана с задержкой сети
      if (error.message?.includes('NetworkError') || error.message?.includes('network') || error.message?.includes('timeout')) {
        throw new Error(`Проблема с сетью. Пожалуйста, проверьте подключение и попробуйте снова.`);
      }
      
      throw error;
    }
    
    console.log('Signin successful, data:', data ? 'Available' : 'Not available');
    
    // Добавляем искусственную задержку для улучшения UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    return data;
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
}

// Функция для выхода пользователя
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Функция для получения текущего пользователя
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;
    
    // Получаем дополнительную информацию о пользователе из таблицы users
    const { data, error } = await supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      // Если пользователь не найден в таблице users, создаем его
      if (error.code === 'PGRST116') {
        const userData = session.user.user_metadata || {};
        const username = userData.username || session.user.email?.split('@')[0] || 'user';
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            username,
            email: session.user.email,
            avatar_url: userData.avatar_url || null,
          })
          .select('username, avatar_url')
          .single();
        
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return null;
        }
        
        return {
          id: session.user.id,
          email: session.user.email!,
          username: newUser.username,
          avatar_url: newUser.avatar_url
        };
      }
      
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email!,
      username: data.username,
      avatar_url: data.avatar_url
    };
  } catch (error) {
    console.error("GetCurrentUser error:", error);
    return null;
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