import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DateSelector } from "./components/date-selector";
import { DayView } from "./components/day-view";
import { Task } from "./components/task-item";
import { AddTaskDialog } from "./components/add-task-dialog";
import { MoveTaskDialog } from "./components/move-task-dialog";
import { SearchDialog } from "./components/search-dialog";
import {
  SettingsDialog,
  UserSettings,
} from "./components/settings-dialog";
import { UserProfileDialog, UserProfile } from "./components/user-profile-dialog";
import { TodayButton } from "./components/today-button";
import { useNotifications } from "./components/use-notifications";
import { Users } from "lucide-react";

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visibleDate, setVisibleDate] = useState(new Date());
  const [agendaTitle, setAgendaTitle] = useState("Mi Agenda");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-1",
    name: "Usuario Demo",
    email: "usuario@demo.com",
    avatarColor: "bg-blue-500"
  });
  const [settings, setSettings] = useState<UserSettings>({
    headerType: "year",
    textColor: "amber",
    backgroundColor: "cream",
    fontFamily: "kalam",
    isShared: false,
    shareCode: undefined,
    connectedUsers: [{
      id: "owner",
      name: "Tú",
      color: "bg-green-500",
      isOwner: true
    }]
  });
  const [moveTaskDialog, setMoveTaskDialog] = useState<{
    open: boolean;
    task: Task | null;
  }>({ open: false, task: null });

  // Hook de notificaciones
  const { scheduleNotification, cancelNotification } = useNotifications();

  // Programar notificaciones existentes al cargar la app
  useEffect(() => {
    tasks.forEach(task => {
      if (task.notification?.enabled && task.notification.minutesBefore && task.time) {
        scheduleNotification(
          task.id,
          task.text,
          task.date,
          task.time,
          task.notification
        );
      }
    });

    // Cleanup al desmontar
    return () => {
      tasks.forEach(task => {
        cancelNotification(task.id);
      });
    };
  }, []); // Solo ejecutar una vez al montar

  // Helper function para generar fecha de hoy
  const getTodayDateString = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [tasks, setTasks] = useState<Task[]>(() => {
  const savedTasks = localStorage.getItem('agendaTasks');
  if (savedTasks) {
    return JSON.parse(savedTasks);
  } else {
    // Si no hay nada guardado, usa estas tareas de ejemplo
    return [
      {
        id: "1",
        text: "Reunión con el equipo",
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
        isPrivate: false,
      },
      {
        id: "2",
        text: "Cita médica personal",
        date: new Date().toISOString().split('T')[0],
        time: "14:30",
        isPrivate: true,
      },
    ];
  }
});

  // Referencias simplificadas
  const containerRef = useRef<HTMLDivElement>(null);
  const [allDays, setAllDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const hasInitialScrolledRef = useRef(false);

  const generateId = () =>
    Math.random().toString(36).substr(2, 9);

  // Inicializar días de manera simple
  useEffect(() => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 21); // 3 semanas antes

    for (let i = 0; i < 42; i++) {
      // 6 semanas de días
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    setAllDays(days);
  }, []);

  // Scroll inicial simplificado
  useEffect(() => {
    if (allDays.length > 0 && !hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;

      const timer = setTimeout(() => {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const todayElement =
          containerRef.current?.querySelector(
            `[data-day-date="${todayStr}"]`,
          );

        if (todayElement && containerRef.current) {
          const elementTop = (todayElement as HTMLElement)
            .offsetTop;
          containerRef.current.scrollTo({
            top: Math.max(0, elementTop - 20),
            behavior: "auto",
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [allDays]);

  // Cargar más días simplificado
  const loadMoreDays = useCallback(
    (direction: "before" | "after") => {
      if (isLoading) return;

      setIsLoading(true);
      setAllDays((prev) => {
        const newDays = [...prev];
        const count = 7; // Solo cargar 1 semana a la vez

        if (direction === "before") {
          const firstDate = new Date(newDays[0]);
          for (let i = count; i > 0; i--) {
            const date = new Date(firstDate);
            date.setDate(firstDate.getDate() - i);
            newDays.unshift(date);
          }
        } else {
          const lastDate = new Date(
            newDays[newDays.length - 1],
          );
          for (let i = 1; i <= count; i++) {
            const date = new Date(lastDate);
            date.setDate(lastDate.getDate() + i);
            newDays.push(date);
          }
        }

        return newDays;
      });

      setTimeout(() => setIsLoading(false), 50);
    },
    [isLoading],
  );

  // Scroll handler muy simplificado
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      // Actualizar fecha visible de manera instantánea
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Cargar más contenido si es necesario
      if (scrollTop < 300) {
        loadMoreDays("before");
      } else if (
        scrollTop >
        scrollHeight - clientHeight - 300
      ) {
        loadMoreDays("after");
      }

      // Actualizar fecha visible de manera instantánea
      const dayElements = container.querySelectorAll(
        "[data-day-date]",
      );
      if (dayElements.length > 0) {
        const containerRect = container.getBoundingClientRect();
        const viewCenter = containerRect.height / 2;

        let closestElement: Element | null = null;
        let closestDistance = Infinity;

        dayElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementCenter =
            rect.top + rect.height / 2 - containerRect.top;
          const distance = Math.abs(elementCenter - viewCenter);

          if (
            distance < closestDistance &&
            rect.top < containerRect.bottom &&
            rect.bottom > containerRect.top
          ) {
            closestDistance = distance;
            closestElement = element;
          }
        });

        if (closestElement) {
          const dateStr =
            closestElement.getAttribute("data-day-date");
          if (dateStr) {
            const date = new Date(dateStr);
            const currentDateStr = visibleDate
              .toISOString()
              .split("T")[0];

            if (dateStr !== currentDateStr) {
              setVisibleDate(date);
              setCurrentDate(date);
            }
          }
        }
      }

      // Limpiar timeout anterior para cargar más días (con debounce ligero)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Solo aplicar debounce para cargar más contenido, no para actualizar fecha
      scrollTimeoutRef.current = setTimeout(() => {
        // Este timeout solo es para evitar múltiples cargas de contenido
      }, 100);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => {
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [loadMoreDays, visibleDate]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo activar si no estamos escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        // Trigger del search dialog - simulamos click en el botón
        const searchButton = document.querySelector('[data-search-trigger]') as HTMLButtonElement;
        if (searchButton) {
          searchButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleAddTask = useCallback((taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      id: generateId(),
      ...taskData,
    };
    setTasks((prev) => [...prev, newTask]);

    // Programar notificación si está habilitada
    if (newTask.notification?.enabled && newTask.notification.minutesBefore && newTask.time) {
      scheduleNotification(
        newTask.id,
        newTask.text,
        newTask.date,
        newTask.time,
        newTask.notification
      );
    }
  }, [scheduleNotification]);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === updatedTask.id) {
          // Cancelar notificación anterior
          cancelNotification(task.id);
          
          // Programar nueva notificación si está habilitada
          if (updatedTask.notification?.enabled && updatedTask.notification.minutesBefore && updatedTask.time) {
            scheduleNotification(
              updatedTask.id,
              updatedTask.text,
              updatedTask.date,
              updatedTask.time,
              updatedTask.notification
            );
          }
          
          return updatedTask;
        }
        return task;
      }),
    );
  }, [scheduleNotification, cancelNotification]);

  const handleDeleteTask = useCallback((taskId: string) => {
    // Cancelar notificación antes de borrar
    cancelNotification(taskId);
    
    setTasks((prev) =>
      prev.filter((task) => task.id !== taskId),
    );
  }, [cancelNotification]);

  // Navegación a fecha específica simplificada
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
    setVisibleDate(date);

    setTimeout(() => {
      const dateStr = date.toISOString().split("T")[0];
      const dayElement = containerRef.current?.querySelector(
        `[data-day-date="${dateStr}"]`,
      );

      if (dayElement && containerRef.current) {
        const elementTop = (dayElement as HTMLElement)
          .offsetTop;
        containerRef.current.scrollTo({
          top: Math.max(0, elementTop - 20),
          behavior: "smooth",
        });
      }
    }, 50);
  }, []);

  // Función para ir al día actual
  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setVisibleDate(today);

    setTimeout(() => {
      const todayStr = today.toISOString().split("T")[0];
      const todayElement = containerRef.current?.querySelector(
        `[data-day-date="${todayStr}"]`,
      );

      if (todayElement && containerRef.current) {
        const elementTop = (todayElement as HTMLElement)
          .offsetTop;
        containerRef.current.scrollTo({
          top: Math.max(0, elementTop - 20),
          behavior: "smooth",
        });
      }
    }, 50);
  }, []);

  const handleProfileChange = useCallback((newProfile: UserProfile) => {
    setUserProfile(newProfile);
  }, []);

  const handleLogout = useCallback(() => {
    // Simular logout y reset a usuario por defecto
    const defaultProfile: UserProfile = {
      id: `user-${Math.random().toString(36).substring(2, 9)}`,
      name: "Nuevo Usuario",
      email: "nuevo@usuario.com",
      avatarColor: "bg-green-500"
    };
    
    setUserProfile(defaultProfile);
    
    // Reset agenda
    setAgendaTitle("Mi Agenda");
    setTasks([]);
    
    // Reset settings parcialmente (mantener preferencias visuales)
    setSettings(prev => ({
      ...prev,
      isShared: false,
      shareCode: undefined,
      connectedUsers: [{
        id: "owner",
        name: "Tú",
        color: "bg-green-500",
        isOwner: true
      }]
    }));
    
    // Mostrar mensaje de confirmación
    setTimeout(() => {
      alert(`¡Hola ${defaultProfile.name}! Has iniciado sesión como nuevo usuario.`);
    }, 100);
  }, []);

  // Función para manejar clic en tarea desde búsqueda
  const handleSearchTaskClick = useCallback((taskId: string, taskDate: string) => {
    const date = new Date(taskDate);
    handleDateChange(date);
    
    // Highlight de la tarea encontrada (opcional)
    setTimeout(() => {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Añadir efecto visual temporal
        taskElement.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-75');
        setTimeout(() => {
          taskElement.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-75');
        }, 2000);
      }
    }, 300);
  }, [handleDateChange]);

  // Get dynamic styles based on settings - Memoized for performance
  const themeColors = useMemo(() => {
    switch (settings.textColor) {
      case "blue":
        return {
          primary: "text-blue-900",
          secondary: "text-blue-800",
          hover: "hover:bg-blue-100",
          background: "bg-blue-50",
        };
      case "green":
        return {
          primary: "text-emerald-900",
          secondary: "text-emerald-800",
          hover: "hover:bg-emerald-100",
          background: "bg-emerald-50",
        };
      case "purple":
        return {
          primary: "text-purple-900",
          secondary: "text-purple-800",
          hover: "hover:bg-purple-100",
          background: "bg-purple-50",
        };
      case "rose":
        return {
          primary: "text-rose-900",
          secondary: "text-rose-800",
          hover: "hover:bg-rose-100",
          background: "bg-rose-50",
        };
      case "slate":
        return {
          primary: "text-slate-900",
          secondary: "text-slate-800",
          hover: "hover:bg-slate-100",
          background: "bg-slate-50",
        };
      case "orange":
        return {
          primary: "text-orange-900",
          secondary: "text-orange-800",
          hover: "hover:bg-orange-100",
          background: "bg-orange-50",
        };
      case "teal":
        return {
          primary: "text-teal-900",
          secondary: "text-teal-800",
          hover: "hover:bg-teal-100",
          background: "bg-teal-50",
        };
      default: // amber
        return {
          primary: "text-amber-900",
          secondary: "text-amber-800",
          hover: "hover:bg-amber-100",
          background: "bg-amber-50",
        };
    }
  }, [settings.textColor]);

  const backgroundColor = useMemo(() => {
    switch (settings.backgroundColor) {
      case "white":
        return "bg-white";
      case "blue":
        return "bg-blue-50";
      case "green":
        return "bg-green-50";
      case "purple":
        return "bg-purple-50";
      case "rose":
        return "bg-rose-50";
      case "amber":
        return "bg-amber-50";
      case "slate":
        return "bg-slate-50";
      default: // cream
        return "bg-background";
    }
  }, [settings.backgroundColor]);

  const fontFamily = useMemo(() => {
    switch (settings.fontFamily) {
      case "caveat":
        return "Caveat, cursive";
      case "inter":
        return "Inter, sans-serif";
      default: // kalam
        return "Kalam, cursive";
    }
  }, [settings.fontFamily]);

  const getHeaderContent = useCallback(() => {
    if (settings.headerType === "year") {
      const year = visibleDate.getFullYear();
      return year.toString();
    }
    return agendaTitle;
  }, [settings.headerType, visibleDate, agendaTitle]);

  // Agrupar días por semanas para mejor layout - Memoized
  const weeks = useMemo(() => {
    const getWeeksFromDays = (days: Date[]) => {
      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }
      return weeks;
    };
    return getWeeksFromDays(allDays);
  }, [allDays]);

  // Get predefined hover colors that work with Tailwind compilation - Memoized
  const hoverColor = useMemo(() => {
    const colorMap = {
      "text-amber-800": "hover:bg-amber-100",
      "text-blue-800": "hover:bg-blue-100",
      "text-emerald-800": "hover:bg-emerald-100",
      "text-purple-800": "hover:bg-purple-100",
      "text-rose-800": "hover:bg-rose-100",
      "text-slate-800": "hover:bg-slate-100",
      "text-orange-800": "hover:bg-orange-100",
      "text-teal-800": "hover:bg-teal-100",
    };
    return (
      colorMap[
        themeColors.secondary as keyof typeof colorMap
      ] || "hover:bg-amber-100"
    );
  }, [themeColors.secondary]);

  const handleMoveTask = useCallback((taskId: string, newDate: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, date: newDate };
          
          // Reprogramar notificación con nueva fecha
          cancelNotification(taskId);
          if (updatedTask.notification?.enabled && updatedTask.notification.minutesBefore && updatedTask.time) {
            scheduleNotification(
              updatedTask.id,
              updatedTask.text,
              updatedTask.date,
              updatedTask.time,
              updatedTask.notification
            );
          }
          
          return updatedTask;
        }
        return task;
      }),
    );
    setMoveTaskDialog({ open: false, task: null });
  }, [scheduleNotification, cancelNotification]);

  const handleReorderTask = useCallback((
    dragId: string,
    hoverId: string,
    targetDate: string,
  ) => {
    setTasks((prev) => {
      const dragTask = prev.find((task) => task.id === dragId);
      if (!dragTask) return prev;

      // Obtener tareas del día objetivo
      const targetDayTasks = prev.filter(
        (task) => task.date === targetDate,
      );
      const otherTasks = prev.filter(
        (task) => task.date !== targetDate,
      );

      // Encontrar la posición del hover task
      const hoverIndex = targetDayTasks.findIndex(
        (task) => task.id === hoverId,
      );

      // Crear nueva lista con la tarea draggeada movida a la nueva posición
      const updatedDragTask = { ...dragTask, date: targetDate };
      
      // Reprogramar notificación si la fecha cambió
      if (dragTask.date !== targetDate) {
        cancelNotification(dragId);
        if (updatedDragTask.notification?.enabled && updatedDragTask.notification.minutesBefore && updatedDragTask.time) {
          scheduleNotification(
            updatedDragTask.id,
            updatedDragTask.text,
            updatedDragTask.date,
            updatedDragTask.time,
            updatedDragTask.notification
          );
        }
      }
      
      const filteredTargetTasks = targetDayTasks.filter(
        (task) => task.id !== dragId,
      );

      // Insertar en la nueva posición
      const newTargetTasks = [...filteredTargetTasks];
      if (hoverIndex >= 0) {
        newTargetTasks.splice(hoverIndex, 0, updatedDragTask);
      } else {
        newTargetTasks.push(updatedDragTask);
      }

      return [...otherTasks, ...newTargetTasks];
    });
  }, [scheduleNotification, cancelNotification]);

  const handleOpenMoveDialog = useCallback((
    taskId: string,
    currentDate: string,
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setMoveTaskDialog({ open: true, task });
    }
  }, [tasks]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen ${backgroundColor}`}
        style={{ fontFamily }}
      >
        {/* Header y Date Selector fijos */}
        <div
          className={`sticky top-0 z-20 ${backgroundColor} shadow-sm`}
        >
          <div className="max-w-2xl mx-auto px-2 sm:px-4 py-1 sm:py-2">
            {/* Header */}
            <header className="relative text-center py-0.5 sm:py-1">
              <AddTaskDialog
                onAddTask={handleAddTask}
                themeColors={themeColors}
              />

              <SearchDialog
                tasks={tasks}
                onTaskClick={handleSearchTaskClick}
                themeColors={themeColors}
              />

              <UserProfileDialog
                profile={userProfile}
                onProfileChange={handleProfileChange}
                onLogout={handleLogout}
                themeColors={themeColors}
              />

              <h1
                className={`text-3xl sm:text-4xl lg:text-5xl ${themeColors.primary} flex items-center justify-center`}
                style={{ fontFamily }}
              >
                {settings.headerType === "custom" ? (
                  isEditingTitle ? (
                    <input
                      type="text"
                      value={agendaTitle}
                      onChange={(e) =>
                        setAgendaTitle(e.target.value)
                      }
                      onBlur={handleTitleBlur}
                      onKeyPress={handleTitleKeyPress}
                      className={`bg-transparent border-none outline-none text-center text-3xl sm:text-4xl lg:text-5xl ${themeColors.primary} placeholder-opacity-70`}
                      style={{
                        fontFamily,
                        width: "auto",
                        minWidth: "200px",
                        maxWidth: "100%",
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={handleTitleClick}
                      className={`cursor-pointer ${hoverColor} px-2 py-1 rounded-lg transition-colors`}
                      title="Haz clic para editar"
                    >
                      {agendaTitle}
                    </span>
                  )
                ) : (
                  <span className="px-2 py-1 text-2xl sm:text-3xl mt-1">
                    {getHeaderContent()}
                  </span>
                )}
              </h1>

              <SettingsDialog
                settings={settings}
                onSettingsChange={setSettings}
                themeColors={themeColors}
              />

              {/* Indicador de usuarios conectados */}
              {settings.isShared && settings.connectedUsers.length > 1 && (
                <div className={`absolute top-2 sm:top-4 right-12 sm:right-16 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${themeColors.background} ${themeColors.secondary} text-xs`}>
                  <Users className="w-3 h-3" />
                  <span>{settings.connectedUsers.length}</span>
                </div>
              )}
            </header>

            {/* Date Selector */}
            <div className="mt-0.5 sm:mt-1">
              <DateSelector
                currentDate={visibleDate}
                onDateChange={handleDateChange}
                themeColors={themeColors}
              />
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div
          ref={containerRef}
          className="max-w-2xl mx-auto p-4 overflow-y-auto relative z-0"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {/* Días en formato de scroll infinito */}
          <main className="space-y-8">
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
              >
                {week.map((date, dayIndex) => {
                  const dateKey = `${date.getTime()}-${dayIndex}`;
                  return (
                    <div
                      key={dateKey}
                      data-day-date={
                        date.toISOString().split("T")[0]
                      }
                    >
                      <DayView
                        date={date}
                        tasks={tasks}
                        onAddTask={handleAddTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onMoveTask={handleOpenMoveDialog}
                        onReorderTask={handleReorderTask}
                        themeColors={themeColors}
                      />
                    </div>
                  );
                })}
              </div>
            ))}

            {isLoading && (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  🙂 Cargando más días felices
                </p>
              </div>
            )}
          </main>

          {/* Footer info */}
          <div className="p-2 mt-6 text-center">
            <p className="text-xs text-stone-500">
              🙂 Cargando más días felices
            </p>
          </div>
        </div>

        {/* Move Task Dialog */}
        <MoveTaskDialog
          open={moveTaskDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setMoveTaskDialog({ open: false, task: null });
            }
          }}
          task={moveTaskDialog.task}
          onMoveTask={handleMoveTask}
          themeColors={themeColors}
        />

        {/* Today Button */}
        <TodayButton
          onGoToToday={handleGoToToday}
          containerRef={containerRef}
          themeColors={themeColors}
        />
      </div>
    </DndProvider>
  );
}
