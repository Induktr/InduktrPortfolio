import { supabase } from "./db";
import { User, InsertUser } from "@shared/schema";

// Типы для работы с комментариями
export type ToolComment = {
  id: string;
  tool_name: string;
  comment: string;
  rating: number;
  user_id: string;
  created_at: string;
};

export type CommentWithUser = {
  id: string;
  username: string;
  comment: string;
  rating: number;
  createdAt: string;
};

export type InsertToolComment = Omit<ToolComment, 'id' | 'created_at' | 'user_id'> & {
  username: string;
};

// Интерфейс хранилища с методами для работы с пользователями и комментариями
export interface IStorage {
  // Методы для работы с пользователями
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Методы для работы с комментариями
  getToolComments(toolName: string): Promise<CommentWithUser[]>;
  addToolComment(comment: InsertToolComment): Promise<ToolComment>;
}

export class SupabaseStorage implements IStorage {
  constructor() {
    console.log("Initializing SupabaseStorage");
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
    
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
    
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user:", error);
      throw error;
    }
    
    return data;
  }

  async getToolComments(toolName: string): Promise<CommentWithUser[]> {
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

    if (error) {
      console.error("Error fetching tool comments:", error);
      throw error;
    }
    
    // Преобразование данных в ожидаемый формат
    return data.map((comment: any) => ({
      id: comment.id,
      username: comment.users?.username || 'Anonymous',
      comment: comment.comment,
      rating: comment.rating,
      createdAt: comment.created_at
    }));
  }

  async addToolComment(comment: InsertToolComment): Promise<ToolComment> {
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
      
      if (userError) {
        console.error("Error creating user:", userError);
        throw userError;
      }
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
    
    if (error) {
      console.error("Error adding tool comment:", error);
      throw error;
    }
    
    return data;
  }
}

// Создаем и экспортируем инстанс хранилища
export const storage = new SupabaseStorage();
