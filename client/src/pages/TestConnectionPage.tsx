import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

type TestResult = {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
};

export default function TestConnectionPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [hasAnonKey, setHasAnonKey] = useState<boolean>(false);

  useEffect(() => {
    // Получаем и отображаем URL Supabase (без ключей)
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    setSupabaseUrl(url);
    setHasAnonKey(!!import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  const runTests = async () => {
    setIsTesting(true);
    setResults([]);
    setConnected(null);
    
    // Тест 1: Проверка переменных окружения
    const envTest: TestResult = {
      name: 'Проверка переменных окружения',
      status: 'pending',
      message: 'Проверка наличия VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY...'
    };
    
    setResults(prev => [...prev, envTest]);
    
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url) {
        throw new Error('VITE_SUPABASE_URL не определен');
      }
      
      if (!key) {
        throw new Error('VITE_SUPABASE_ANON_KEY не определен');
      }
      
      setResults(prev => prev.map(r => 
        r.name === envTest.name 
          ? { ...r, status: 'success', message: 'Переменные окружения настроены корректно' } 
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === envTest.name 
          ? { ...r, status: 'error', message: error.message } 
          : r
      ));
      setConnected(false);
      setIsTesting(false);
      return;
    }
    
    // Тест 2: Проверка соединения с Supabase
    const connectionTest: TestResult = {
      name: 'Проверка соединения с Supabase',
      status: 'pending',
      message: 'Отправка ping-запроса к Supabase...'
    };
    
    setResults(prev => [...prev, connectionTest]);
    
    try {
      const startTime = Date.now();
      
      // Используем простой запрос для проверки соединения
      const { data, error, status } = await supabase
        .from('ping')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        throw new Error(`Ошибка соединения: ${error.message} (код: ${status})`);
      }
      
      setResults(prev => prev.map(r => 
        r.name === connectionTest.name 
          ? { 
              ...r, 
              status: 'success', 
              message: `Соединение установлено успешно за ${duration}ms`, 
              duration 
            } 
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === connectionTest.name 
          ? { ...r, status: 'error', message: error.message } 
          : r
      ));
      setConnected(false);
      setIsTesting(false);
      return;
    }
    
    // Тест 3: Проверка аутентификации
    const authTest: TestResult = {
      name: 'Проверка API аутентификации',
      status: 'pending',
      message: 'Проверка доступности API аутентификации...'
    };
    
    setResults(prev => [...prev, authTest]);
    
    try {
      const startTime = Date.now();
      
      // Проверяем только доступность API аутентификации без входа
      const { data, error } = await supabase.auth.getSession();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        throw new Error(`Ошибка API аутентификации: ${error.message}`);
      }
      
      setResults(prev => prev.map(r => 
        r.name === authTest.name 
          ? { 
              ...r, 
              status: 'success', 
              message: `API аутентификации доступно (${duration}ms)`, 
              duration 
            } 
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.name === authTest.name 
          ? { ...r, status: 'error', message: error.message } 
          : r
      ));
    }
    
    setConnected(true);
    setIsTesting(false);
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Проверка соединения с Supabase</CardTitle>
          <CardDescription>
            Эта страница поможет проверить соединение с сервером Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Информация о конфигурации</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                <span className="font-medium">URL Supabase:</span>
                <span className="text-muted-foreground">{supabaseUrl || 'Не указан'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                <span className="font-medium">Ключ доступа:</span>
                <span className="text-muted-foreground">
                  {hasAnonKey ? 'Настроен' : 'Не указан'}
                </span>
              </div>
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Результаты тестов</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start justify-between p-3 rounded-md ${
                      result.status === 'success' 
                        ? 'bg-green-500/10' 
                        : result.status === 'error' 
                          ? 'bg-red-500/10' 
                          : 'bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {result.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                      {result.status === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    {result.duration && (
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {connected === true && (
            <Alert className="bg-green-500/10 border-green-500/50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Соединение установлено</AlertTitle>
              <AlertDescription>
                Подключение к Supabase работает корректно. Вы можете продолжить использование приложения.
              </AlertDescription>
            </Alert>
          )}
          
          {connected === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка соединения</AlertTitle>
              <AlertDescription>
                Не удалось установить соединение с Supabase. Проверьте настройки и интернет-соединение.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/" className="text-primary hover:underline">
            Вернуться на главную
          </Link>
          <Button onClick={runTests} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Проверка...
              </>
            ) : 'Проверить соединение'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 