import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Серверный API-эндпоинт для регистрации пользователей
export default async function handleSignUp(req: Request, res: Response) {
  try {
    // Проверяем наличие важных переменных окружения
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing environment variables',
        env: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      });
    }

    // Извлекаем данные из запроса
    const { email, password, username } = req.body;
    
    // Проверяем наличие обязательных полей
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and username are required'
      });
    }

    // Используем обычный метод signUp вместо admin API
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${req.protocol}://${req.get('host')}/signin`
      }
    });

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message,
        error
      });
    }

    if (!data || !data.user) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
      });
    }

    // Создаем профиль пользователя (опционально)
    try {
      await supabase.from('users').insert({
        id: data.user.id,
        username,
        email,
        avatar_url: null
      });
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      // Продолжаем, так как профиль можно создать позже
    }

    // Возвращаем успешный ответ
    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        username
      },
      emailConfirmationRequired: !data.session
    });
  } catch (error: any) {
    console.error('Server exception during signup:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message || 'Unknown error'
    });
  }
} 