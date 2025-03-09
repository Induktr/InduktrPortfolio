import { createClient } from '@supabase/supabase-js';

// Получаем URL и ключ из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Выводим значения для отладки
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Defined' : 'Undefined');

// Проверяем наличие URL и ключа
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in environment variables');
}

// Создаем клиент Supabase с таймаутами и расширенными настройками
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: (url, options) => {
      // Устанавливаем таймаут для fetch запросов в 10 секунд
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const fetchOptions = {
        ...options,
        signal: controller.signal,
      };

      return fetch(url, fetchOptions)
        .then(response => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('Supabase fetch error:', error);
          if (error.name === 'AbortError') {
            throw new Error('Запрос был прерван из-за таймаута. Пожалуйста, попробуйте снова.');
          }
          throw error;
        });
    }
  }
});

// Типы для работы с комментариями
export type ToolComment = {
  id: number | string;
  tool_name: string;
  comment: string;
  rating: number;
  user_id: string;
  created_at: string;
};

export type InsertToolComment = Omit<ToolComment, 'id' | 'created_at' | 'user_id'> & {
  username: string;
};

// Функция для получения комментариев к инструменту
export async function getToolComments(toolName: string) {
  const { data, error } = await supabase
    .from('tool_comments')
    .select(`
      id,
      comment,
      rating,
      created_at,
      user_id
    `)
    .eq('tool_name', toolName)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Если данных нет, возвращаем пустой массив
  if (!data || data.length === 0) {
    return [];
  }
  
  // Получаем информацию о пользователях для комментариев
  const userIds = Array.from(new Set(data.map(comment => comment.user_id)));
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds);
  
  if (usersError) throw usersError;
  
  // Создаем карту пользователей для быстрого доступа
  const userMap = new Map();
  users?.forEach(user => {
    userMap.set(user.id, user.username);
  });
  
  // Преобразование данных в ожидаемый формат
  return data.map((comment: any) => ({
    id: comment.id,
    username: userMap.get(comment.user_id) || 'Anonymous',
    comment: comment.comment,
    rating: comment.rating,
    createdAt: comment.created_at
  }));
}

// Функция для добавления комментария
export async function addToolComment(comment: InsertToolComment) {
  // Сначала проверяем, существует ли пользователь
  let userId;
  
  // Исправленный запрос для поиска пользователя
  const { data: existingUsers, error: searchError } = await supabase
    .from('users')
    .select('id')
    .eq('username', comment.username);
  
  if (searchError) throw searchError;
  
  const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;
  
  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Если пользователя нет, создаем нового
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ username: comment.username })
      .select('id')
      .single();
    
    if (userError) throw userError;
    userId = newUser.id;
  }
  
  // Добавляем комментарий
  const { data, error } = await supabase
    .from('tool_comments')
    .insert({
      tool_name: comment.tool_name,
      comment: comment.comment,
      rating: comment.rating,
      user_id: userId
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
} 