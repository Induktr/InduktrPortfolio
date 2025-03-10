import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY not set');
}

// Серверный API-эндпоинт для регистрации пользователей
export default async function handleSignUp(req: Request, res: Response) {
  const { email, password, username } = req.body;

  // Проверяем наличие обязательных полей
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and username are required'
    });
  }

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting server-side signup for ${email}`);

  try {
    // Создаем клиент Supabase с сервисным ключом
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Создаем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Автоматически подтверждаем email
      user_metadata: { username }
    });

    if (authError) {
      console.error(`[${new Date().toISOString()}] Auth error during signup:`, authError);
      return res.status(authError.status || 500).json({
        success: false,
        message: authError.message,
        error: authError
      });
    }

    console.log(`[${new Date().toISOString()}] Auth user created successfully: ${authData.user.id}`);

    try {
      // Создаем профиль пользователя в таблице users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          email,
          avatar_url: null,
          created_at: new Date().toISOString()
        })
        .select();

      if (profileError) {
        console.warn(`[${new Date().toISOString()}] Error creating user profile:`, profileError);
        // Продолжаем, так как учетная запись создана успешно
      } else {
        console.log(`[${new Date().toISOString()}] User profile created successfully`);
      }

      // Возвращаем ответ с данными пользователя
      return res.status(200).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username
        },
        emailConfirmationRequired: false, // Мы автоматически подтверждаем email
        responseTime: Date.now() - startTime
      });
    } catch (profileError) {
      console.error(`[${new Date().toISOString()}] Exception during profile creation:`, profileError);
      
      // Возвращаем ответ, так как учетная запись создана успешно
      return res.status(200).json({
        success: true,
        message: 'User registered successfully, but profile creation failed',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username
        },
        emailConfirmationRequired: false,
        profileCreationFailed: true,
        responseTime: Date.now() - startTime
      });
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Server exception during signup:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
      responseTime: Date.now() - startTime
    });
  }
} 