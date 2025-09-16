import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function ScrollToTop({ themeColors }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

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
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg ${colors.background} ${colors.primary} ${hoverColor} border-2 border-current transition-all duration-300 hover:scale-110`}
      size="sm"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-6 h-6" />
    </Button>
  );
}