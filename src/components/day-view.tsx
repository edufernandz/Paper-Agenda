import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { TaskItem, Task } from './task-item';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Star } from 'lucide-react';

interface DayViewProps {
  date: Date;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, newDate: string) => void;
  onReorderTask?: (dragId: string, hoverId: string, targetDate: string) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function DayView({ date, tasks, onAddTask, onUpdateTask, onDeleteTask, onMoveTask, onReorderTask, themeColors }: DayViewProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const dayName = dayNamesFull[date.getDay()];
  const dayNumber = date.getDate();
  
  const dateString = date.toISOString().split('T')[0];
  const dayTasks = tasks.filter(task => task.date === dateString);

  // Drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: Task) => {
      // Si la tarea es del mismo día, no hacer nada aquí (se maneja con reorder)
      if (item.date !== dateString) {
        // Mover la tarea a este día
        onMoveTask(item.id, dateString);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask({
        text: newTaskText.trim(),
        date: dateString,
        time: newTaskTime || undefined,
        isPrivate: false
      });
      setNewTaskText('');
      setNewTaskTime('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const isToday = dateString === new Date().toISOString().split('T')[0];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  // Default colors if not provided
  const colors = themeColors || {
    primary: 'text-amber-900',
    secondary: 'text-amber-800',
    hover: 'hover:bg-amber-100',
    background: 'bg-amber-50'
  };

  // Get button colors for the add task button
  const getButtonColors = () => {
    const colorMap = {
      'text-amber-800': { bg: 'bg-amber-50', text: 'text-amber-900', hover: 'hover:bg-amber-100' },
      'text-blue-800': { bg: 'bg-blue-50', text: 'text-blue-900', hover: 'hover:bg-blue-100' },
      'text-emerald-800': { bg: 'bg-emerald-50', text: 'text-emerald-900', hover: 'hover:bg-emerald-100' },
      'text-purple-800': { bg: 'bg-purple-50', text: 'text-purple-900', hover: 'hover:bg-purple-100' },
      'text-rose-800': { bg: 'bg-rose-50', text: 'text-rose-900', hover: 'hover:bg-rose-100' },
      'text-slate-800': { bg: 'bg-slate-50', text: 'text-slate-900', hover: 'hover:bg-slate-100' },
      'text-orange-800': { bg: 'bg-orange-50', text: 'text-orange-900', hover: 'hover:bg-orange-100' },
      'text-teal-800': { bg: 'bg-teal-50', text: 'text-teal-900', hover: 'hover:bg-teal-100' },
    };
    return colorMap[colors.secondary as keyof typeof colorMap] || colorMap['text-amber-800'];
  };

  const buttonColors = getButtonColors();
  
  return (
    <div 
      ref={drop}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[400px] transition-colors ${
        isOver ? 'border-blue-300 bg-blue-50' : ''
      }`}
    >
      {/* Header */}
      <div className={`flex justify-between items-center p-4 border-b border-gray-200 ${isWeekend ? 'bg-gray-100' : ''}`}>
        <h3 className={`font-bold text-lg ${isToday ? colors.primary : 'text-gray-900'}`}>
          {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
          <span className="text-gray-500 font-medium ml-1">{dayNumber}</span>
        </h3>
        {isToday && <Star className={`w-4 h-4 fill-current ${colors.primary}`} />}
      </div>

      {/* Content with lined paper effect */}
      <div 
        className="flex-1 px-4 pt-4 pb-2 relative"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, #F0F0F0, #F0F0F0 1px, transparent 1px, transparent 1.5rem)',
          lineHeight: '1.5rem',
          minHeight: '14rem'
        }}
      >
        {/* Add new task */}
        <div className="mb-4 space-y-2 relative z-10">
          <div className="flex gap-2 p-2 bg-white/70 rounded-lg border border-gray-200/50 relative z-0">
            <Input
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              placeholder="HH:MM"
              className="w-20 h-8 text-sm bg-white border border-gray-300 shadow-sm focus:border-current focus:ring-1 focus:ring-current"
            />
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Nueva tarea..."
              className="flex-1 h-8 text-sm bg-white border border-gray-300 shadow-sm focus:border-current focus:ring-1 focus:ring-current"
              onKeyPress={handleKeyPress}
            />
            <Button
              onClick={handleAddTask}
              size="sm"
              className={`h-8 w-8 p-0 ${buttonColors.bg} ${buttonColors.text} ${buttonColors.hover} border border-current shadow-sm`}
              disabled={!newTaskText.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-1 relative z-10">
          {dayTasks.length > 0 ? (
            dayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
                onReorder={onReorderTask}
                colors={themeColors}
              />
            ))
          ) : (
            <p className="text-gray-400 text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
              Sin eventos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}