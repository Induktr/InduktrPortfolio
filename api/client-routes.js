// Обработка клиентских маршрутов для SPA
// Перенаправляет все запросы на index.html для обработки клиентским маршрутизатором

export default function handler(req, res) {
  // Установка заголовков, чтобы гарантировать, что содержимое будет отображаться как HTML
  res.setHeader('Content-Type', 'text/html');
  
  // Перенаправление на index.html
  res.status(200).send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Induktr - Портфолио</title>
  
  <!-- Базовые стили для загрузчика -->
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f0f2f5;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: #333;
    }
    
    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .spinner {
      border: 5px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 5px solid #3498db;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .message {
      font-size: 18px;
      text-align: center;
    }
    
    .status {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
  </style>
  
  <!-- Перенаправление на главную страницу -->
  <script>
    window.location.href = '/';
  </script>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <div class="message">Загрузка приложения...</div>
    <div class="status">Перенаправление на главную страницу</div>
  </div>
</body>
</html>
  `);
} 