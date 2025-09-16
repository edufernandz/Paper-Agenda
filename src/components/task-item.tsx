import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Edit3, Lock, ArrowRight, GripVertical, Mic, Play, Pause, Bell, BellOff } from 'lucide-react';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { VoiceRecorder } from './voice-recorder';
import { useNotifications } from './use-notifications';

export interface Task {
  id: string;
  text: string;
  date: string;
  time?: string;
  isPrivate: boolean;
  voiceNote?: string; // URL del blob de audio
  notification?: {
    enabled: boolean;
    minutesBefore?: number;
  };
}

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, currentDate: string) => void;
  onReorder: (dragId: string, hoverId: string, targetDate: string) => void;
  colors: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function TaskItem({
  task,
  onUpdate,
  onDelete,
  onMove,
  onReorder,
  colors
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editTime, setEditTime] = useState(task.time || '');
  const [isPrivate, setIsPrivate] = useState(task.isPrivate);
  const [showActions, setShowActions] = useState(false);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para notificaciones en edición
  const [notificationEnabled, setNotificationEnabled] = useState(task.notification?.enabled || false);
  const [minutesBefore, setMinutesBefore] = useState(task.notification?.minutesBefore || 15);
  
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  const { isSupported, permission, requestPermission } = useNotifications();

  // Solicitar permisos cuando se habilitan las notificaciones en edición
  useEffect(() => {
    if (notificationEnabled && permission !== 'granted') {
      requestPermission().then(granted => {
        if (!granted) {
          setNotificationEnabled(false);
        }
      });
    }
  }, [notificationEnabled, permission, requestPermission]);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Drag functionality
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'task',
    item: { 
      id: task.id, 
      text: task.text, 
      date: task.date, 
      time: task.time, 
      isPrivate: task.isPrivate 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality for reordering
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    hover: (draggedItem: Task) => {
      if (!ref.current) return;
      
      const draggedId = draggedItem.id;
      const hoveredId = task.id;
      
      // No hacer nada si es la misma tarea
      if (draggedId === hoveredId) return;
      
      // Llamar al reorder si las fechas coinciden o si se está moviendo entre días
      onReorder(draggedId, hoveredId, task.date);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Conectar drag y drop refs
  drag(drop(ref));
  dragPreview(ref);

  // Handlers para notas de voz
  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    onUpdate({
      ...task,
      voiceNote: audioUrl
    });
    setIsVoiceDialogOpen(false);
  };

  const handlePlayVoiceNote = () => {
    if (!task.voiceNote) return;
    
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(task.voiceNote);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlayingAudio(true);
      audio.onpause = () => setIsPlayingAudio(false);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        console.error('Error playing audio');
      };
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlayingAudio(false);
      });
    }
  };

  const handleDeleteVoiceNote = () => {
    onUpdate({
      ...task,
      voiceNote: undefined
    });
  };

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      text: editText,
      time: editTime,
      isPrivate
    };

    // Añadir configuración de notificación si está habilitada
    if (notificationEnabled && isSupported && permission === 'granted') {
      updatedTask.notification = {
        enabled: true,
        minutesBefore
      };
    } else {
      updatedTask.notification = undefined;
    }

    onUpdate(updatedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.text);
    setEditTime(task.time || '');
    setIsPrivate(task.isPrivate);
    setNotificationEnabled(task.notification?.enabled || false);
    setMinutesBefore(task.notification?.minutesBefore || 15);
    setIsEditing(false);
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

  const getHoverColors = () => {
    const colorMap = {
      'text-amber-800': { text: 'hover:text-amber-700', bg: 'hover:bg-amber-100' },
      'text-blue-800': { text: 'hover:text-blue-700', bg: 'hover:bg-blue-100' },
      'text-emerald-800': { text: 'hover:text-emerald-700', bg: 'hover:bg-emerald-100' },
      'text-purple-800': { text: 'hover:text-purple-700', bg: 'hover:bg-purple-100' },
      'text-rose-800': { text: 'hover:text-rose-700', bg: 'hover:bg-rose-100' },
      'text-slate-800': { text: 'hover:text-slate-700', bg: 'hover:bg-slate-100' },
      'text-orange-800': { text: 'hover:text-orange-700', bg: 'hover:bg-orange-100' },
      'text-teal-800': { text: 'hover:text-teal-700', bg: 'hover:bg-teal-100' },
    };
    return colorMap[colors.secondary as keyof typeof colorMap] || colorMap['text-amber-800'];
  };

  const buttonColors = getButtonColors();
  const hoverColors = getHoverColors();

  // Detectar cuando se hace clic fuera para ocultar acciones
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showActions, isMobile]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (isEditing) {
    return (
      <div className={`flex flex-col gap-2 p-3 ${colors.background} rounded-lg border border-dashed border-current/30`}>
        <div className="flex gap-2">
          <Input
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            placeholder="HH:MM"
            className="w-20 h-8 text-sm"
          />
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Escribir tarea..."
            className="flex-1 h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                id={`private-${task.id}`}
              />
              <label htmlFor={`private-${task.id}`} className="text-sm text-gray-700">
                Privado
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={notificationEnabled}
                onCheckedChange={setNotificationEnabled}
                id={`notification-${task.id}`}
              />
              <label htmlFor={`notification-${task.id}`} className="text-sm text-gray-700">
                {notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </label>
            </div>
            
            {task.voiceNote && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteVoiceNote}
                className="h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                Borrar nota de voz
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              onClick={handleSave} 
              className={`h-7 px-2 ${buttonColors.bg} ${buttonColors.hoverBg} text-white`}
            >
              Guardar
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel} 
              className="h-7 px-2 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
          </div>
        </div>
        
        {/* Configuración de notificaciones */}
        {notificationEnabled && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex gap-2">
              <Select value={minutesBefore.toString()} onValueChange={(value) => setMinutesBefore(Number(value))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="1440">Un día</SelectItem>
                  <SelectItem value="10080">Una semana</SelectItem>
                </SelectContent>
              </Select>
              
              <span className="flex-1 text-sm text-gray-700 flex items-center">
                Antes de la tarea
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      data-task-id={task.id}
      className={`group flex items-baseline py-1 px-2 ${colors.hover} rounded transition-colors ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      } ${isOver ? 'border-t-2 border-blue-400' : ''}`}
      onPointerDown={(e) => {
        if (!isMobile) return;
        touchTimeoutRef.current = setTimeout(() => {
          setShowActions(true);
        }, 300);
      }}
      onPointerUp={(e) => {
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }}
      onPointerMove={(e) => {
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }}
      onPointerLeave={(e) => {
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }}
    >
      {task.time && (
        <span className="text-sm text-gray-500 w-12 flex-shrink-0">
          {task.time}
        </span>
      )}
      <div className="flex-1 flex items-baseline">
        {task.voiceNote && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayVoiceNote}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 mr-2 flex-shrink-0"
            title={isPlayingAudio ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        )}
        {task.notification?.enabled && (
          <Bell className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" title="Notificación programada" />
        )}
        {task.isPrivate && (
          <Lock className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
        )}
        <span 
          className={`text-xl whitespace-pre-wrap ${
            task.isPrivate ? 'text-gray-500 italic' : colors.secondary
          }`}
          style={{ fontFamily: 'Caveat, cursive' }}
        >
          {task.text}
        </span>
      </div>
      <div className={`flex gap-1 transition-opacity ml-1 ${
        isMobile 
          ? (showActions ? 'opacity-100' : 'opacity-0') 
          : 'opacity-0 group-hover:opacity-100'
      }`}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className={`h-6 w-6 p-0 text-gray-400 ${hoverColors.text} ${hoverColors.bg}`}
        >
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMove(task.id, task.date)}
          className={`h-6 w-6 p-0 text-gray-400 ${hoverColors.text} ${hoverColors.bg}`}
          title="Mover tarea"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(task.id)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-100"
              title={task.voiceNote ? 'Editar nota de voz' : 'Añadir nota de voz'}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              onCancel={() => setIsVoiceDialogOpen(false)}
              existingAudio={task.voiceNote}
              isEditing={!!task.voiceNote}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}