import { createClient } from '@supabase/supabase-js';
import { logWithTimestamp } from './logger';

// Получаем URL и ключ из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Информация для отладки
console.log('Supabase URL defined:', !!supabaseUrl);
console.log('Supabase Anon Key defined:', !!supabaseAnonKey);

// Убедимся, что URL и ключ определены
if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');

// Сокращаем таймаут
const REQUEST_TIMEOUT = 15000; // 15 секунд вместо 50 секунд

// Создаем экземпляр клиента Supabase с расширенной конфигурацией
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': `Induktr Web v${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    },
    // Расширенный fetch с таймаутом и логированием
    fetch: (url, options = {}) => {
      logWithTimestamp('debug', `Supabase fetch request to: ${url.toString()}`);
      
      // Создаем контроллер для прерывания запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        logWithTimestamp('warn', `Aborting request to ${url.toString()} due to timeout (${REQUEST_TIMEOUT}ms)`);
      }, REQUEST_TIMEOUT);
      
      // Объединяем наши опции с опциями по умолчанию
      const fetchOptions = {
        ...options,
        signal: controller.signal,
      };
      
      return fetch(url, fetchOptions)
        .then((response) => {
          clearTimeout(timeoutId);
          logWithTimestamp('debug', `Supabase response status: ${response.status}`);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            logWithTimestamp('error', `Request to ${url.toString()} timed out after ${REQUEST_TIMEOUT}ms`);
            throw new Error(`Превышено время ожидания (${Math.floor(REQUEST_TIMEOUT/1000)}с) при выполнении операции`);
          }
          logWithTimestamp('error', `Fetch error for ${url.toString()}: ${error.message}`);
          throw error;
        });
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    timeout: 15000, // 15 секунд для realtime соединений вместо 50 секунд
  },
  db: {
    schema: 'public',
  },
});

export default supabase;

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