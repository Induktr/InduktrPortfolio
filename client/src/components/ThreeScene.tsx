import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  width?: number;
  height?: number;
  background?: string;
  animate?: boolean;
  children?: React.ReactNode;
}

/**
 * Компонент для рендеринга 3D-сцены с использованием Three.js
 * С обработкой потери контекста WebGL
 */
const ThreeScene: React.FC<ThreeSceneProps> = ({
  width = window.innerWidth,
  height = window.innerHeight,
  background = 'transparent',
  animate = true,
  children,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Функция для запуска анимации
  const startAnimation = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      // Рендеринг сцены
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Продолжаем анимацию
      animationRef.current = requestAnimationFrame(animate);
    };

    // Запуск цикла анимации
    animationRef.current = requestAnimationFrame(animate);
  };

  // Обработчик потери контекста WebGL
  const handleContextLost = () => {
    console.warn('THREE.WebGLRenderer: Context Lost. Attempting to restore...');
    
    // Если есть анимация, останавливаем ее
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Пытаемся перезагрузить сцену через небольшую задержку
    setTimeout(() => {
      try {
        if (rendererRef.current) {
          console.log('THREE.WebGLRenderer: Attempting to restore context...');
          
          // Пробуем восстановить контекст
          // Обратите внимание, что WebGLRenderer не имеет метода forceContextRestore,
          // поэтому мы просто пересоздаем сцену
          if (mountRef.current) {
            // Удаляем старый canvas
            while (mountRef.current.firstChild) {
              mountRef.current.removeChild(mountRef.current.firstChild);
            }
            
            // Пересоздаем рендерер
            setupScene();
            
            // Перезапускаем анимацию
            if (animate && !animationRef.current) {
              startAnimation();
            }
            
            console.log('THREE.WebGLRenderer: Context restored successfully');
          }
        }
      } catch (error) {
        console.error('THREE.WebGLRenderer: Failed to restore context', error);
      }
    }, 1000);
  };

  // Функция настройки сцены
  const setupScene = () => {
    if (!mountRef.current) return;

    // Создаем новый рендерер
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: background === 'transparent',
      powerPreference: 'high-performance',
      precision: 'highp',
      preserveDrawingBuffer: true, // Для стабильности контекста WebGL
    });
    
    // Настраиваем рендерер
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    if (background !== 'transparent') {
      renderer.setClearColor(new THREE.Color(background));
    }

    // Устанавливаем обработчики событий WebGL
    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      handleContextLost();
    });
    
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('THREE.WebGLRenderer: Context Restored by browser');
      // Перезапускаем рендеринг
      if (animate && !animationRef.current) {
        startAnimation();
      }
    });
    
    // Добавляем canvas в DOM
    mountRef.current.appendChild(canvas);
    
    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      75, // field of view
      width / height, // aspect ratio
      0.1, // near clipping plane
      1000 // far clipping plane
    );
    camera.position.z = 5;
    
    // Сохраняем ссылки
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Отмечаем, что сцена готова
    setIsReady(true);
    
    // Запускаем анимацию, если нужно
    if (animate) {
      startAnimation();
    } else {
      // Если анимация не нужна, просто рендерим один раз
      renderer.render(sceneRef.current, camera);
    }
  };

  // Инициализация сцены при монтировании компонента
  useEffect(() => {
    setupScene();
    
    // Очистка при размонтировании
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Обновление размеров при изменении width или height
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    
    rendererRef.current.setSize(width, height);
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    // Обновляем рендеринг
    if (!animate && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [width, height, animate]);

  // Обновление фона при изменении background
  useEffect(() => {
    if (!rendererRef.current) return;
    
    if (background === 'transparent') {
      rendererRef.current.setClearColor(0x000000, 0);
    } else {
      rendererRef.current.setClearColor(new THREE.Color(background));
    }
    
    // Обновляем рендеринг
    if (!animate && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [background, animate]);

  return (
    <div 
      ref={mountRef}
      style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {isReady && children}
    </div>
  );
};

export default ThreeScene; 