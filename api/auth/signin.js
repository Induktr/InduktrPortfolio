// Прокси-функция для входа в систему
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });
  }

  try {
    // Получаем данные из тела запроса
    const { email, password } = req.body;

    // Проверяем наличие всех необходимых полей
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Проверяем наличие переменных окружения
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing environment variables',
        env: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      });
    }

    // Создаем клиент Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Авторизуем пользователя
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Для более понятного сообщения об ошибке
      const errorMessage = error.message === 'Invalid login credentials'
        ? 'Неверный email или пароль. Пожалуйста, проверьте введенные данные и попробуйте снова.'
        : error.message;
        
      return res.status(error.status || 401).json({
        success: false,
        message: errorMessage,
        error
      });
    }

    if (!data || !data.user) {
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate user'
      });
    }

    // Получаем дополнительную информацию о пользователе
    let userData = null;
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', data.user.id)
        .single();
        
      if (!profileError) {
        userData = userProfile;
      }
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Продолжаем выполнение, данные профиля не критичны
    }

    // Отправляем успешный ответ
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: userData?.username || data.user.user_metadata?.username || 'user',
        avatar_url: userData?.avatar_url || null
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (error) {
    console.error('Server error during signin:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message || 'Unknown error'
    });
  }
} 