import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY not set');
}

// Серверный API-эндпоинт для входа пользователей
export default async function handleSignIn(req: Request, res: Response) {
  const { email, password } = req.body;

  // Проверяем наличие обязательных полей
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting server-side signin for ${email}`);

  try {
    // Создаем клиент Supabase с сервисным ключом
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Авторизуем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error(`[${new Date().toISOString()}] Auth error during signin:`, authError);
      
      // Возвращаем понятное сообщение об ошибке
      const errorMessage = authError.message === 'Invalid login credentials'
        ? 'Неверный email или пароль. Пожалуйста, проверьте введенные данные и попробуйте снова.'
        : authError.message;
      
      return res.status(authError.status || 401).json({
        success: false,
        message: errorMessage,
        error: authError,
        responseTime: Date.now() - startTime
      });
    }

    console.log(`[${new Date().toISOString()}] User authenticated successfully: ${authData.user.id}`);

    try {
      // Получаем дополнительные данные пользователя из таблицы users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, avatar_url, created_at')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.warn(`[${new Date().toISOString()}] Error fetching user profile:`, userError);
      } else {
        console.log(`[${new Date().toISOString()}] User profile fetched successfully`);
      }

      // Возвращаем ответ с данными пользователя и токеном сессии
      return res.status(200).json({
        success: true,
        message: 'User authenticated successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: userData?.username || authData.user.user_metadata?.username || 'user',
          avatar_url: userData?.avatar_url || null,
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        },
        responseTime: Date.now() - startTime
      });
    } catch (profileError) {
      console.error(`[${new Date().toISOString()}] Exception during profile fetch:`, profileError);
      
      // Возвращаем ответ, так как аутентификация прошла успешно
      return res.status(200).json({
        success: true,
        message: 'User authenticated successfully, but profile fetch failed',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.user_metadata?.username || 'user'
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at
        },
        profileFetchFailed: true,
        responseTime: Date.now() - startTime
      });
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Server exception during signin:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
} 