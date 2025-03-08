import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Redirect } from 'wouter';

const profileSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно содержать минимум 3 символа'),
  avatar_url: z.string().url('Введите корректный URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    return <Redirect to="/signin" />;
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username || '',
      avatar_url: user.avatar_url || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        username: values.username,
        avatar_url: values.avatar_url || null,
      });
      
      toast({
        title: 'Профиль обновлен',
        description: 'Ваш профиль успешно обновлен',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      toast({
        title: 'Ошибка обновления профиля',
        description: error.message || 'Произошла ошибка при обновлении профиля',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Профиль пользователя</h1>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar_url || undefined} alt={user.username || ''} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <CardTitle>{user.username || 'Пользователь'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Редактировать профиль</CardTitle>
            <CardDescription>
              Обновите информацию о себе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL аватара</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={handleSignOut}>
              Выйти из аккаунта
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 