import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type InsertComment, insertCommentSchema } from "@shared/schema";
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

  // Инициализация формы с расширенной валидацией
  const form = useForm<InsertComment>({
    resolver: zodResolver(
      insertCommentSchema.extend({
        rating: insertCommentSchema.shape.rating.min(1, "Please select a rating")
      })
    ),
    defaultValues: {
      toolName,
      comment: "",
      rating: 0,
    },
  });

  // Получение комментариев
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/comments", toolName],
    queryFn: async () => {
      const response = await fetch(`/api/comments?tool=${encodeURIComponent(toolName)}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to fetch comments");
      }
      return response.json() as Promise<CommentWithUser[]>;
    },
  });

  // Мутация для отправки комментария
  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async (data: InsertComment) => {
      console.log("Submitting comment:", { ...data, rating });
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          ...data,
          rating: Number(rating)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post comment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", toolName] });
      form.reset();
      setRating(0);
      toast({
        title: "Success",
        description: "Your comment has been posted",
      });
    },
    onError: (error: Error) => {
      console.error("Comment submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Обработчик отправки формы
  const onSubmit = (data: InsertComment) => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }
    console.log("Form submission:", { ...data, rating });
    submitComment({ ...data, rating });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  form.setValue('rating', value);
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
                <FormLabel>Your comment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your thoughts about this tool..."
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
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
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