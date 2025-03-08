import { createClient } from '@supabase/supabase-js';

// Получаем URL и ключ из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      users (
        username
      )
    `)
    .eq('tool_name', toolName)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Преобразование данных в ожидаемый формат
  return data.map((comment: any) => ({
    id: comment.id,
    username: comment.users?.username || 'Anonymous',
    comment: comment.comment,
    rating: comment.rating,
    createdAt: comment.created_at
  }));
}

// Функция для добавления комментария
export async function addToolComment(comment: InsertToolComment) {
  // Сначала проверяем, существует ли пользователь
  let userId;
  
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', comment.username)
    .single();
  
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
