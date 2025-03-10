import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Серверный API-эндпоинт для регистрации пользователей
export default async function handleSignUp(req: Request, res: Response) {
  try {
    console.log(`[${new Date().toISOString()}] Starting server-side signup, checking env variables`);
    
    // Проверяем наличие переменных окружения перед выполнением операций
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${new Date().toISOString()}] Missing Supabase environment variables`);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing Supabase credentials'
      });
    }

    const { email, password, username } = req.body;
    console.log(`[${new Date().toISOString()}] Request body received:`, { 
      email: email ? 'provided' : 'missing', 
      password: password ? 'provided' : 'missing',
      username: username || 'missing'
    });

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

      if (!authData || !authData.user) {
        console.error(`[${new Date().toISOString()}] No user data returned from Supabase Auth`);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user account',
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
      } catch (profileError: any) {
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
          error: profileError?.message || 'Unknown error during profile creation',
          responseTime: Date.now() - startTime
        });
      }
    } catch (supabaseError: any) {
      console.error(`[${new Date().toISOString()}] Supabase operation error:`, supabaseError);
      
      return res.status(500).json({
        success: false,
        message: 'Error during Supabase operations',
        error: supabaseError?.message || 'Unknown Supabase error',
        responseTime: Date.now() - startTime
      });
    }
  } catch (serverError: any) {
    console.error(`[${new Date().toISOString()}] Unhandled server exception during signup:`, serverError);
    
    return res.status(500).json({
      success: false,
      message: 'Unhandled server error during registration',
      error: serverError?.message || 'Unknown server error',
    });
  }
} 