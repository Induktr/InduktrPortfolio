import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { z } from "zod";
import { getToolComments, addToolComment } from "@/lib/supabase";

interface ToolCommentsProps {
  toolName: string;
}

type CommentWithUser = {
  id: number | string;
  username: string;
  comment: string;
  rating: number;
  createdAt: string;
};

// Схема валидации для комментария
const commentSchema = z.object({
  toolName: z.string(),
  comment: z.string().min(3, "Комментарий должен содержать минимум 3 символа"),
  rating: z.number().min(1, "Пожалуйста, выберите рейтинг"),
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа")
});

export function ToolComments({ toolName }: ToolCommentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [username, setUsername] = useState("");

  // Инициализация формы с валидацией через Zod
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      toolName,
      comment: "",
      rating: 0,
      username: ""
    },
  });

  // Запрос комментариев с Supabase
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["tool-comments", toolName],
    queryFn: async () => {
      try {
        return await getToolComments(toolName);
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
    },
  });

  // Отправка нового комментария через Supabase
  const onSubmit = async (data: z.infer<typeof commentSchema>) => {
    try {
      await addToolComment({
        tool_name: data.toolName,
        comment: data.comment,
        rating: data.rating,
        username: data.username
      });
      
      // Обновление кэша запроса
      queryClient.invalidateQueries({ queryKey: ["tool-comments", toolName] });

      // Сброс формы и тост с сообщением об успехе
      form.reset({ toolName, comment: "", rating: 0, username: "" });
      setRating(0);
      
      toast({
        title: "Комментарий добавлен",
        description: "Ваш комментарий успешно добавлен",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отправить комментарий",
        variant: "destructive",
      });
    }
  };

  // Обработка изменения рейтинга
  const handleRatingChange = (value: number) => {
    setRating(value);
    form.setValue("rating", value, {
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">Добавить комментарий</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => {
                          field.onChange(e);
                          setUsername(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Поделитесь своим мнением..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Рейтинг</FormLabel>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleRatingChange(value)}
                          className="cursor-pointer focus:outline-none"
                        >
                          {value <= rating ? (
                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <Star className="h-6 w-6 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Отправка..." : "Отправить комментарий"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Комментарии ({comments.length})</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Нет комментариев. Будьте первым, кто оставит комментарий!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{comment.username}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <span key={value}>
                          {value <= comment.rating ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <Star className="h-4 w-4 text-gray-300" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{comment.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}