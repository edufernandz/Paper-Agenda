import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Calendar, Bell, BellOff } from 'lucide-react';
import { Task } from './task-item';
import { useNotifications } from './use-notifications';

interface AddTaskDialogProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function AddTaskDialog({ onAddTask, themeColors }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [taskText, setTaskText] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Estados para notificaciones
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [minutesBefore, setMinutesBefore] = useState<number>(15);
  
  const { isSupported, permission, requestPermission } = useNotifications();

  // Solicitar permisos cuando se habilitan las notificaciones
  useEffect(() => {
    if (notificationEnabled && permission !== 'granted') {
      requestPermission().then(granted => {
        if (!granted) {
          setNotificationEnabled(false);
        }
      });
    }
  }, [notificationEnabled, permission, requestPermission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskText.trim() || !selectedDate) return;

    // Fix timezone issue: use local date instead of UTC
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const newTask: Omit<Task, 'id'> = {
      text: taskText.trim(),
      date: dateString,
      time: taskTime || undefined,
      isPrivate,
    };

    // Añadir configuración de notificación si está habilitada
    if (notificationEnabled && isSupported && permission === 'granted') {
      newTask.notification = {
        enabled: true,
        minutesBefore,
      };
    }

    onAddTask(newTask);

    // Reset form
    setTaskText('');
    setTaskTime('');
    setIsPrivate(false);
    setNotificationEnabled(false);
    setMinutesBefore(15);
    setSelectedDate(new Date());
    setOpen(false);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return 'Seleccionar fecha';
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = dayNames[selectedDate.getDay()];
    const dayNumber = selectedDate.getDate();
    const monthName = monthNames[selectedDate.getMonth()];
    
    return `${dayName}, ${dayNumber} de ${monthName}`;
  };

  // Default colors if not provided
  const colors = themeColors || {
    primary: 'text-amber-900',
    secondary: 'text-amber-800',
    hover: 'hover:bg-amber-100',
    background: 'bg-amber-50'
  };

  // Get CSS custom properties for dynamic styling
  const getButtonColors = () => {
    const colorMap = {
      'text-amber-800': { bg: 'bg-amber-800', hoverBg: 'hover:bg-amber-900' },
      'text-blue-800': { bg: 'bg-blue-800', hoverBg: 'hover:bg-blue-900' },
      'text-emerald-800': { bg: 'bg-emerald-800', hoverBg: 'hover:bg-emerald-900' },
      'text-purple-800': { bg: 'bg-purple-800', hoverBg: 'hover:bg-purple-900' },
      'text-rose-800': { bg: 'bg-rose-800', hoverBg: 'hover:bg-rose-900' },
      'text-slate-800': { bg: 'bg-slate-800', hoverBg: 'hover:bg-slate-900' },
      'text-orange-800': { bg: 'bg-orange-800', hoverBg: 'hover:bg-orange-900' },
      'text-teal-800': { bg: 'bg-teal-800', hoverBg: 'hover:bg-teal-900' },
    };
    return colorMap[colors.secondary as keyof typeof colorMap] || colorMap['text-amber-800'];
  };

  const buttonColors = getButtonColors();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`fixed bottom-6 right-6 z-40 p-0 rounded-full shadow-lg ${colors.background} ${colors.secondary} ${colors.hover} w-14 h-14 flex items-center justify-center border-2 border-current/20 hover:border-current/40 transition-all duration-200 hover:scale-105`}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={colors.primary} style={{ fontFamily: 'Kalam, cursive' }}>
            Añadir Nueva Tarea
          </DialogTitle>
          <DialogDescription>
            Crea una nueva tarea seleccionando una fecha y añadiendo los detalles necesarios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className={`text-sm ${colors.secondary} mb-3`}>
                {formatSelectedDate()}
              </p>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time and Task Input */}
          <div className="space-y-3">
            <div>
              <label htmlFor="task-time" className="block text-sm font-medium text-gray-700 mb-1">
                Hora (opcional)
              </label>
              <Input
                id="task-time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                placeholder="HH:MM"
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="task-text" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de la tarea
              </label>
              <Input
                id="task-text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="¿Qué tienes que hacer?"
                className="w-full"
                autoFocus
              />
            </div>
          </div>

          {/* Private Toggle */}
          <div className={`flex items-center justify-between p-3 ${colors.background} rounded-lg`}>
            <span className="text-sm font-medium text-gray-700">Tarea privada</span>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              id="task-private"
            />
          </div>

          {/* Notificación Toggle */}
          <div className={`flex items-center justify-between p-3 ${colors.background} rounded-lg`}>
            <span className="text-sm font-medium text-gray-700">Notificación</span>
            <Switch
              checked={notificationEnabled}
              onCheckedChange={setNotificationEnabled}
              id="task-notification"
            />
          </div>

          {/* Tipo de Notificación */}
          {notificationEnabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo antes de la tarea
                </label>
                <div className="flex gap-2">
                  <Select value={minutesBefore.toString()} onValueChange={(value) => setMinutesBefore(Number(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutos antes</SelectItem>
                      <SelectItem value="10">10 minutos antes</SelectItem>
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="1440">Un día antes</SelectItem>
                      <SelectItem value="10080">Una semana antes</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <span className="flex-1 text-sm text-gray-700 flex items-center">
                    Antes de la tarea
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className={`${buttonColors.bg} ${buttonColors.hoverBg} text-white`}
              disabled={!taskText.trim() || !selectedDate}
            >
              Crear Tarea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}