import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Search, Calendar, Clock, Lock, X } from 'lucide-react';
import { Task } from './task-item';

interface SearchDialogProps {
  tasks: Task[];
  onTaskClick: (taskId: string, date: string) => void;
  themeColors: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function SearchDialog({ tasks, onTaskClick, themeColors }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filtrar tareas basado en el texto de búsqueda
  const filteredTasks = useMemo(() => {
    if (!searchText.trim()) return [];
    
    const searchLower = searchText.toLowerCase();
    return tasks.filter(task => 
      task.text.toLowerCase().includes(searchLower) ||
      (task.time && task.time.includes(searchText)) ||
      task.date.includes(searchText)
    ).slice(0, 10); // Limitar a 10 resultados para mejor rendimiento
  }, [tasks, searchText]);

  // Resetear al abrir/cerrar
  useEffect(() => {
    if (open) {
      setSearchText('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredTasks.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredTasks.length - 1
        );
      } else if (e.key === 'Enter' && filteredTasks.length > 0) {
        e.preventDefault();
        const selectedTask = filteredTasks[selectedIndex];
        if (selectedTask) {
          onTaskClick(selectedTask.id, selectedTask.date);
          setOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredTasks, selectedIndex, onTaskClick]);

  // Actualizar índice seleccionado cuando cambian los resultados
  useEffect(() => {
    if (selectedIndex >= filteredTasks.length) {
      setSelectedIndex(0);
    }
  }, [filteredTasks.length, selectedIndex]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = date.toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    if (dateString === todayString) return 'Hoy';
    if (dateString === yesterdayString) return 'Ayer';
    if (dateString === tomorrowString) return 'Mañana';

    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleTaskClick = (task: Task) => {
    onTaskClick(task.id, task.date);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          data-search-trigger
          className={`absolute top-2 sm:top-4 right-8 sm:right-12 p-1.5 sm:p-2 rounded-full ${themeColors.secondary} ${themeColors.hover}`}
          title="Buscar tareas (Ctrl+F)"
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Tareas
          </DialogTitle>
          <DialogDescription>
            Encuentra rápidamente cualquier tarea buscando por texto, fecha o hora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por texto, fecha o hora..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchText('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Resultados */}
          <ScrollArea className="h-96">
            {searchText.trim() === '' ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Escribe para buscar tus tareas</p>
                <p className="text-sm mt-1">Puedes buscar por texto, fecha o hora</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron tareas</p>
                <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  {filteredTasks.length} resultado{filteredTasks.length !== 1 ? 's' : ''} encontrado{filteredTasks.length !== 1 ? 's' : ''}
                </p>
                
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? `${themeColors.background} ${themeColors.secondary} border-current` 
                        : `${themeColors.hover} border-gray-200`
                    }`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {task.isPrivate && (
                            <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          )}
                          <p className="font-medium truncate">{task.text}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.date)}</span>
                          </div>
                          
                          {task.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {task.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          Privada
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Instrucciones de teclado */}
          {filteredTasks.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center justify-center gap-4 pt-2 border-t">
              <span>↑↓ navegar</span>
              <span>Enter seleccionar</span>
              <span>Esc cerrar</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}