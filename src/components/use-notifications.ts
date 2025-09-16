import { useEffect, useCallback, useRef } from 'react';

export interface NotificationSettings {
  enabled: boolean;
  minutesBefore?: number;
}

export function useNotifications() {
  const scheduledNotifications = useRef<Map<string, number>>(new Map());

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Mostrar notificación inmediata
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico', // Se puede personalizar
        badge: '/favicon.ico',
        tag: 'agenda-task',
        requireInteraction: true, // La notificación permanece hasta que el usuario interactúe
        ...options,
      });

      // Auto-cerrar después de 10 segundos si el usuario no interactúa
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    }
    return null;
  }, []);

  // Programar notificación para una tarea
  const scheduleNotification = useCallback((
    taskId: string,
    taskText: string,
    taskDate: string,
    taskTime: string,
    notificationSettings: NotificationSettings
  ) => {
    // Cancelar notificación anterior si existe
    const existingTimeout = scheduledNotifications.current.get(taskId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      scheduledNotifications.current.delete(taskId);
    }

    if (!notificationSettings.enabled || !taskTime || !notificationSettings.minutesBefore) {
      return;
    }

    // Calcular tiempo de notificación
    const [hours, minutes] = taskTime.split(':').map(Number);
    const notificationTime = new Date(taskDate);
    notificationTime.setHours(hours, minutes, 0, 0);
    notificationTime.setMinutes(notificationTime.getMinutes() - notificationSettings.minutesBefore);

    const now = new Date();
    const timeUntilNotification = notificationTime.getTime() - now.getTime();

    // Solo programar si es en el futuro
    if (timeUntilNotification > 0) {
      const timeoutId = setTimeout(() => {
        const formattedTime = taskTime ? ` a las ${taskTime}` : '';
        const formattedDate = new Date(taskDate).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });

        showNotification(`Recordatorio: ${taskText}`, {
          body: `Tarea programada para ${formattedDate}${formattedTime}`,
          icon: '/favicon.ico',
          tag: `task-${taskId}`,
        });

        scheduledNotifications.current.delete(taskId);
      }, timeUntilNotification);

      scheduledNotifications.current.set(taskId, timeoutId as unknown as number);
    }
  }, [showNotification]);

  // Cancelar notificación programada
  const cancelNotification = useCallback((taskId: string) => {
    const timeoutId = scheduledNotifications.current.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      scheduledNotifications.current.delete(taskId);
    }
  }, []);

  // Limpiar todas las notificaciones al desmontar
  useEffect(() => {
    return () => {
      scheduledNotifications.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      scheduledNotifications.current.clear();
    };
  }, []);

  // Verificar soporte de notificaciones
  const isSupported = 'Notification' in window;

  return {
    isSupported,
    requestPermission,
    showNotification,
    scheduleNotification,
    cancelNotification,
    permission: isSupported ? Notification.permission : 'denied',
  };
}