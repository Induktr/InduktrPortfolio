import { QueryClient, QueryFunction } from "@tanstack/react-query";
import supabase from './supabase';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) options.body = JSON.stringify(data);

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [url, ...params] = queryKey as [string, ...any[]];
    
    try {
      if (url.startsWith('/api/comments')) {
        const toolName = params[0];
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
      
      // Для других запросов используем обычный fetch
      const res = await fetch(url);
      await throwIfResNotOk(res);
      return res.json();
    } catch (e: any) {
      if (e.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
      }
      throw e;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
