// Прокси-функция для регистрации 
// В реальной ситуации здесь будет серверный код, но для нашего случая просто перенаправляем
import { createClient } from '@supabase/supabase-js';

// Функция обработчик запросов
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
    const { email, password, username } = req.body;

    // Проверяем наличие всех необходимых полей
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and username are required'
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

    // Регистрируем пользователя
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${req.headers.origin || process.env.VERCEL_URL || 'http://localhost:3000'}/signin`
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
        message: 'Failed to create user account'
      });
    }

    // Пытаемся создать профиль пользователя
    try {
      await supabase.from('users').insert({
        id: data.user.id,
        username,
        email,
        avatar_url: null
      });
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      // Продолжаем выполнение, профиль можно создать позже
    }

    // Отправляем успешный ответ
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
  } catch (error) {
    console.error('Server error during signup:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message || 'Unknown error'
    });
  }
} 