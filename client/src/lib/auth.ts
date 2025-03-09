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

// Вспомогательная функция для логирования с временной меткой
function logWithTimestamp(type: 'info' | 'error' | 'warn', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logFn = type === 'info' ? console.log : type === 'error' ? console.error : console.warn;
  
  if (data) {
    logFn(`[${timestamp}] ${message}`, data);
  } else {
    logFn(`[${timestamp}] ${message}`);
  }
}

// Функция для регистрации нового пользователя
export async function signUp({ email, password, username }: SignUpCredentials) {
  let startTime = Date.now();
  logWithTimestamp('info', `Starting signup process for email: ${email}, username: ${username}`);
  
  try {
    // Проверяем подключение к Supabase перед выполнением регистрации
    try {
      const { data: pingData, error: pingError } = await supabase.from('ping').select('*').limit(1);
      if (pingError) {
        logWithTimestamp('warn', 'Supabase connection test failed, but continuing with signup', pingError);
      } else {
        logWithTimestamp('info', 'Supabase connection test successful');
      }
    } catch (pingError) {
      logWithTimestamp('warn', 'Supabase ping test failed with exception, but continuing', pingError);
    }
    
    // Регистрация пользователя через Supabase Auth - без опций метаданных
    logWithTimestamp('info', 'Calling supabase.auth.signUp');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }  // Теперь передаем username сразу при создании
      }
    });

    logWithTimestamp('info', `Auth signUp completed in ${Date.now() - startTime}ms with status: ${authData ? 'success' : 'error'}`);

    if (authError) {
      logWithTimestamp('error', 'Auth error during signup:', authError);
      
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
      
      // Если email уже используется
      if (authError.message?.includes('already exists')) {
        throw new Error(`Email ${email} уже зарегистрирован. Пожалуйста, используйте другой email или войдите в систему.`);
      }
      
      throw authError;
    }

    logWithTimestamp('info', 'Auth data after signup:', authData);

    if (!authData || !authData.user) {
      logWithTimestamp('error', 'No user data returned from signup');
      throw new Error('Ошибка регистрации: не удалось создать пользователя');
    }

    startTime = Date.now();
    // Создание записи в таблице users
    try {
      logWithTimestamp('info', 'Creating user profile in users table');
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          email,
          avatar_url: null,
        })
        .select()
        .single();

      if (profileError) {
        logWithTimestamp('error', "Error creating user profile:", profileError);
        
        // Если это ошибка дублирования записи, возможно пользователь уже существует
        if (profileError.code === '23505') { // PostgreSQL уникальный индекс нарушен
          logWithTimestamp('info', 'User profile likely already exists, continuing...');
        } else {
          logWithTimestamp('warn', 'Non-critical profile creation error:', profileError.message);
        }
      } else {
        logWithTimestamp('info', `User profile created successfully in ${Date.now() - startTime}ms:`, profileData);
      }
    } catch (profileError) {
      logWithTimestamp('error', 'Exception during user profile creation:', profileError);
      // Продолжаем выполнение, так как аутентификация прошла успешно
    }

    // Добавляем искусственную задержку для улучшения UX
    logWithTimestamp('info', 'Adding artificial delay for UX improvement');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Получаем текущую сессию для проверки успешности аутентификации
    startTime = Date.now();
    logWithTimestamp('info', 'Fetching session after signup');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logWithTimestamp('error', 'Error getting session after signup:', sessionError);
    } else {
      logWithTimestamp('info', `Session fetched in ${Date.now() - startTime}ms: ${session?.session ? 'Available' : 'Not available'}`);
    }
    
    logWithTimestamp('info', 'Signup process completed successfully');
    return authData;
  } catch (error) {
    logWithTimestamp('error', "SignUp process failed with exception:", error);
    throw error;
  }
}

// Функция для входа пользователя
export async function signIn({ email, password }: SignInCredentials) {
  let startTime = Date.now();
  logWithTimestamp('info', `Starting signin process for email: ${email}`);
  
  try {
    // Проверяем подключение к Supabase перед выполнением входа
    try {
      const { data: pingData, error: pingError } = await supabase.from('ping').select('*').limit(1);
      if (pingError) {
        logWithTimestamp('warn', 'Supabase connection test failed, but continuing with signin', pingError);
      } else {
        logWithTimestamp('info', 'Supabase connection test successful');
      }
    } catch (pingError) {
      logWithTimestamp('warn', 'Supabase ping test failed with exception, but continuing', pingError);
    }
    
    // Вход пользователя
    logWithTimestamp('info', 'Calling supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    logWithTimestamp('info', `Auth signIn completed in ${Date.now() - startTime}ms with status: ${data ? 'success' : 'error'}`);

    if (error) {
      logWithTimestamp('error', 'Auth error during signin:', error);
      
      // Проверяем, является ли ошибка ограничением запросов (429)
      if (error.status === 429) {
        const waitTimeMatch = error.message.match(/after (\d+) seconds/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 20;
        
        throw new Error(`Слишком много запросов. Пожалуйста, подождите ${waitTime} секунд перед повторной попыткой.`);
      }
      
      // Проверяем, является ли ошибка неверными учетными данными
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Неверный email или пароль. Пожалуйста, проверьте введенные данные и попробуйте снова.');
      }
      
      // Если ошибка связана с задержкой сети
      if (error.message?.includes('NetworkError') || error.message?.includes('network') || error.message?.includes('timeout')) {
        throw new Error(`Проблема с сетью. Пожалуйста, проверьте подключение и попробуйте снова.`);
      }
      
      throw error;
    }
    
    logWithTimestamp('info', 'Signin data:', data);
    
    // Проверяем и обновляем сессию
    startTime = Date.now();
    logWithTimestamp('info', 'Fetching session after signin');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logWithTimestamp('error', 'Error getting session after signin:', sessionError);
    } else {
      logWithTimestamp('info', `Session fetched in ${Date.now() - startTime}ms: ${sessionData?.session ? 'Available' : 'Not available'}`);
    }
    
    // Добавляем искусственную задержку для улучшения UX
    logWithTimestamp('info', 'Adding artificial delay for UX improvement');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logWithTimestamp('info', 'Signin process completed successfully');
    return data;
  } catch (error) {
    logWithTimestamp('error', "SignIn process failed with exception:", error);
    throw error;
  }
}

// Функция для выхода пользователя
export async function signOut() {
  logWithTimestamp('info', 'Starting signout process');
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logWithTimestamp('error', 'Error during signout:', error);
      throw error;
    }
    logWithTimestamp('info', 'Signout completed successfully');
  } catch (error) {
    logWithTimestamp('error', 'Exception during signout:', error);
    throw error;
  }
}

// Функция для получения текущего пользователя
export async function getCurrentUser(): Promise<AuthUser | null> {
  logWithTimestamp('info', 'Getting current user');
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logWithTimestamp('error', 'Error getting session:', sessionError);
      return null;
    }
    
    if (!session?.user) {
      logWithTimestamp('info', 'No active session found');
      return null;
    }
    
    logWithTimestamp('info', 'Session found, user ID:', session.user.id);
    
    // Получаем дополнительную информацию о пользователе из таблицы users
    const { data, error } = await supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      logWithTimestamp('error', 'Error fetching user profile:', error);
      
      // Если пользователь не найден в таблице users, создаем его
      if (error.code === 'PGRST116') {
        logWithTimestamp('info', 'User not found in database, creating new profile');
        
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
          logWithTimestamp('error', 'Error creating user profile:', insertError);
          return null;
        }
        
        logWithTimestamp('info', 'New user profile created:', newUser);
        
        return {
          id: session.user.id,
          email: session.user.email!,
          username: newUser.username,
          avatar_url: newUser.avatar_url
        };
      }
      
      return null;
    }
    
    logWithTimestamp('info', 'User profile retrieved successfully');
    
    return {
      id: session.user.id,
      email: session.user.email!,
      username: data.username,
      avatar_url: data.avatar_url
    };
  } catch (error) {
    logWithTimestamp('error', 'Exception in getCurrentUser:', error);
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