import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY not set');
}

// Серверный API-эндпоинт для проверки текущего пользователя
export default async function handleGetCurrentUser(req: Request, res: Response) {
  const accessToken = req.headers.authorization?.split(' ')[1] || '';

  // Проверяем наличие токена
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required'
    });
  }

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Checking current user from server`);

  try {
    // Создаем клиент Supabase с сервисным ключом
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Создаем клиент с токеном пользователя для проверки
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // Проверяем токен пользователя
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error(`[${new Date().toISOString()}] Error checking user token:`, authError);
      return res.status(authError.status || 401).json({
        success: false,
        message: 'Invalid or expired token',
        error: authError,
        responseTime: Date.now() - startTime
      });
    }

    if (!authData.user) {
      console.warn(`[${new Date().toISOString()}] No user found for token`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        responseTime: Date.now() - startTime
      });
    }

    console.log(`[${new Date().toISOString()}] User found: ${authData.user.id}`);

    try {
      // Получаем дополнительные данные пользователя из таблицы users
      const { data: userData, error: userError } = await adminSupabase
        .from('users')
        .select('username, avatar_url, created_at')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.warn(`[${new Date().toISOString()}] Error fetching user profile:`, userError);
      } else {
        console.log(`[${new Date().toISOString()}] User profile fetched successfully`);
      }

      // Проверяем сессию пользователя
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      // Возвращаем данные пользователя
      return res.status(200).json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: userData?.username || authData.user.user_metadata?.username || 'user',
          avatar_url: userData?.avatar_url || null,
          created_at: userData?.created_at || authData.user.created_at
        },
        session: sessionData?.session ? {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_at: sessionData.session.expires_at
        } : null,
        responseTime: Date.now() - startTime
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching additional user data:`, error);
      
      // Возвращаем базовые данные пользователя
      return res.status(200).json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.user_metadata?.username || 'user'
        },
        profileFetchFailed: true,
        responseTime: Date.now() - startTime
      });
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Server exception during current user check:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error checking current user',
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
} 