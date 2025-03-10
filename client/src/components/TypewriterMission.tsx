import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';

// Массив фраз для отображения
const missionPhrases = [
  "I create tech solutions that empower businesses.",
  "I educate developers globally through my content.",
  "I build MVPs that validate innovative ideas.",
  "I share crypto insights for the Web3 community.",
  "I connect tech enthusiasts across platforms."
];

export function TypewriterMission() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Эффект для мигающего курсора
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Эффект для анимации печатной машинки
  useEffect(() => {
    const phrase = missionPhrases[currentPhrase];
    
    if (isTyping) {
      if (displayedText.length < phrase.length) {
        // Печатаем по одной букве с разной скоростью для более реалистичного эффекта
        const timeout = setTimeout(() => {
          setDisplayedText(phrase.substring(0, displayedText.length + 1));
        }, 50 + Math.random() * 30);
        
        return () => clearTimeout(timeout);
      } else {
        // Закончили печатать, ждем перед стиранием
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        // Стираем по одной букве
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, 30);
        
        return () => clearTimeout(timeout);
      } else {
        // Закончили стирать, переходим к следующей фразе
        setCurrentPhrase((currentPhrase + 1) % missionPhrases.length);
        setIsTyping(true);
      }
    }
  }, [currentPhrase, displayedText, isTyping]);

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Youtube className="h-6 w-6 text-red-500" />
        </motion.div>
        <h2 className="text-xl font-semibold">My Place in the Tech World</h2>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-6 shadow-inner relative overflow-hidden">
        <div className="absolute top-3 left-3 flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        
        <motion.div 
          className="font-mono text-lg md:text-2xl text-center mt-6 min-h-[3rem] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative">
            {displayedText}
            <motion.span 
              className={`absolute ${showCursor ? 'opacity-100' : 'opacity-0'} ml-0.5`}
              aria-hidden="true"
            >
              |
            </motion.span>
          </span>
        </motion.div>
        
        <div className="mt-6 flex justify-between items-center text-sm text-muted-foreground">
          <span>Mission Statement</span>
          <span>@Induktr</span>
        </div>
      </div>
    </div>
  );
} 