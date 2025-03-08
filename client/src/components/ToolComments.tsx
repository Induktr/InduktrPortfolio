import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type InsertComment, insertCommentSchema } from "@shared/schema.js";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolCommentsProps {
  toolName: string;
}

type CommentWithUser = {
  id: number;
  username: string;
  comment: string;
  rating: number;
  createdAt: string;
};

export function ToolComments({ toolName }: ToolCommentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);

  // Инициализация формы с валидацией через Zod
  const form = useForm<InsertComment>({
    resolver: zodResolver(
      insertCommentSchema.extend({
        rating: insertCommentSchema.shape.rating.min(1, "Пожалуйста, выберите рейтинг")
      })
    ),
    defaultValues: {
      toolName,
      comment: "",
      rating: 0,
    },
  });

  // Запрос комментариев с сервера
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/comments", toolName],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/comments?tool=${encodeURIComponent(toolName)}`);
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Не удалось загрузить комментарии");
        }
        return response.json() as Promise<CommentWithUser[]>;
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
    },
  });

  // Мутация для создания нового комментария
  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async (commentData: InsertComment) => {
      try {
        console.log("Отправка комментария:", commentData);

        const response = await fetch("/api/comments", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(commentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Не удалось отправить комментарий");
        }

        return response.json();
      } catch (error) {
        console.error("Ошибка отправки комментария:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Очистка формы и обновление списка комментариев
      queryClient.invalidateQueries({ queryKey: ["/api/comments", toolName] });
      form.reset();
      setRating(0);
      toast({
        title: "Успех",
        description: "Ваш комментарий опубликован",
      });
    },
    onError: (error: Error) => {
      console.error("Ошибка публикации:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось опубликовать комментарий",
        variant: "destructive",
      });
    },
  });

  // Обработчик отправки формы
  const onSubmit = form.handleSubmit((data) => {
    if (rating === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите рейтинг",
        variant: "destructive",
      });
      return;
    }

    // Подготовка данных для отправки
    const commentData: InsertComment = {
      ...data,
      toolName,
      rating: Number(rating),
    };

    console.log("Подготовленные данные:", commentData);
    submitComment(commentData);
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                size="sm"
                className="p-0 h-8 w-8"
                onClick={() => {
                  setRating(value);
                  form.setValue("rating", value, { 
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= rating ? "fill-primary" : "fill-none"
                  } text-primary`}
                />
              </Button>
            ))}
          </div>

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ваш комментарий</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Поделитесь своими мыслями об этом инструменте..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Публикация..." : "Опубликовать комментарий"}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Комментарии</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Загрузка комментариев...</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground">Пока нет комментариев. Будьте первым!</p>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{comment.username}</span>
                  <div className="flex">
                    {Array.from({ length: comment.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{comment.comment}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}