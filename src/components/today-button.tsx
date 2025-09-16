import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

interface TodayButtonProps {
  onGoToToday: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function TodayButton({ onGoToToday, containerRef, themeColors }: TodayButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAwayFromToday, setIsAwayFromToday] = useState(false);

  // Default colors if not provided
  const colors = themeColors || {
    primary: 'text-amber-900',
    secondary: 'text-amber-800',
    hover: 'hover:bg-amber-100',
    background: 'bg-amber-50'
  };

  // Get predefined hover colors that work with Tailwind compilation
  const getHoverColors = () => {
    const colorMap = {
      'text-amber-800': 'hover:bg-amber-100',
      'text-blue-800': 'hover:bg-blue-100',
      'text-emerald-800': 'hover:bg-emerald-100',
      'text-purple-800': 'hover:bg-purple-100',
      'text-rose-800': 'hover:bg-rose-100',
      'text-slate-800': 'hover:bg-slate-100',
      'text-orange-800': 'hover:bg-orange-100',
      'text-teal-800': 'hover:bg-teal-100',
    };
    return colorMap[colors.secondary as keyof typeof colorMap] || 'hover:bg-amber-100';
  };

  const hoverColor = getHoverColors();

  useEffect(() => {
    const checkTodayVisibility = () => {
      if (!containerRef.current) return;

      // Check if we've scrolled away from today
      const today = new Date().toISOString().split('T')[0];
      const todayElement = containerRef.current.querySelector(`[data-day-date="${today}"]`);
      
      if (todayElement) {
        const rect = todayElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Check if today's element is visible in the viewport
        const isInView = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
        
        setIsAwayFromToday(!isInView);
        setIsVisible(!isInView && containerRef.current.scrollTop > 100);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkTodayVisibility, { passive: true });
      // Check initial state
      checkTodayVisibility();
      
      return () => container.removeEventListener('scroll', checkTodayVisibility);
    }
  }, [containerRef]);

  if (!isVisible || !isAwayFromToday) {
    return null;
  }

  return (
    <Button
      onClick={onGoToToday}
      className={`fixed bottom-24 right-6 z-50 p-0 rounded-full shadow-lg ${colors.background} ${colors.secondary} ${colors.hover} w-14 h-14 flex items-center justify-center border-2 border-current/20 hover:border-current/40 transition-all duration-200 hover:scale-105`}
      size="sm"
      aria-label="Ir a hoy"
      title="Volver al día actual"
    >
      <Calendar className="w-6 h-6" />
    </Button>
  );
}