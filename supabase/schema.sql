-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Создание таблицы комментариев к инструментам
CREATE TABLE IF NOT EXISTS public.tool_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Создание индексов для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_tool_comments_tool_name ON public.tool_comments(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_comments_user_id ON public.tool_comments(user_id);

-- Настройка политик безопасности Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_comments ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Пользователи могут просматривать свои записи" 
  ON public.users FOR SELECT 
  USING (true);

CREATE POLICY "Пользователи могут создавать свои записи" 
  ON public.users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Пользователи могут обновлять свои записи" 
  ON public.users FOR UPDATE 
  USING (true);

-- Политики для таблицы tool_comments
CREATE POLICY "Все могут просматривать комментарии" 
  ON public.tool_comments FOR SELECT 
  USING (true);

CREATE POLICY "Аутентифицированные пользователи могут добавлять комментарии" 
  ON public.tool_comments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Пользователи могут удалять только свои комментарии" 
  ON public.tool_comments FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять только свои комментарии" 
  ON public.tool_comments FOR UPDATE 
  USING (auth.uid() = user_id);

-- Создание представления для удобного получения комментариев с информацией о пользователях
CREATE OR REPLACE VIEW public.tool_comments_with_users AS
SELECT 
  tc.id,
  tc.tool_name,
  tc.comment,
  tc.rating,
  tc.created_at,
  u.id as user_id,
  u.username
FROM 
  public.tool_comments tc
JOIN 
  public.users u ON tc.user_id = u.id;

-- Предоставление прав на использование таблиц и представлений
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT ON public.users TO anon, authenticated;
GRANT SELECT ON public.tool_comments TO anon, authenticated;
GRANT INSERT ON public.tool_comments TO anon, authenticated;
GRANT SELECT ON public.tool_comments_with_users TO anon, authenticated; 