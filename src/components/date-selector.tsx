import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';

interface DateSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function DateSelector({ currentDate, onDateChange, themeColors }: DateSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setIsCalendarOpen(false);
    }
  };

  const formatWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startMonth = monthNames[startOfWeek.getMonth()].substring(0, 3);
    const endMonth = monthNames[endOfWeek.getMonth()].substring(0, 3);
    
    return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="flex justify-between items-center my-3 sm:my-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousWeek}
        className={`p-1.5 sm:p-2 rounded-full ${hoverColor} transition-colors ${colors.secondary}`}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            className={`text-lg sm:text-xl font-bold ${colors.primary} w-32 sm:w-48 text-center p-1.5 sm:p-2 rounded-lg ${themeColors.hover} transition-colors`}
          >
            {formatWeekRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={currentDate}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextWeek}
        className={`p-1.5 sm:p-2 rounded-full ${hoverColor} transition-colors ${colors.secondary}`}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </div>
  );
}