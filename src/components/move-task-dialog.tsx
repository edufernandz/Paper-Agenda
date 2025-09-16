import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Task } from "./task-item";

interface MoveTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onMoveTask: (taskId: string, newDate: string) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function MoveTaskDialog({
  open,
  onOpenChange,
  task,
  onMoveTask,
  themeColors,
}: MoveTaskDialogProps) {
  const [selectedDate, setSelectedDate] = useState<
    Date | undefined
  >(undefined);

  // Reset selected date when modal opens or task changes
  useEffect(() => {
    if (open && task) {
      // Start with today's date as default
      setSelectedDate(new Date());
    } else if (!open) {
      // Clear selection when modal closes
      setSelectedDate(undefined);
    }
  }, [open, task]);

  const handleMove = () => {
    if (!task || !selectedDate) return;

    // Fix timezone issue: use local date instead of UTC
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(
      2,
      "0",
    );
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const newDateString = `${year}-${month}-${day}`;

    console.log(
      "Moving task:",
      task.id,
      "to date:",
      newDateString,
    ); // Debug log
    onMoveTask(task.id, newDateString);
    // No necesitamos cerrar el modal aquí porque App.tsx se encarga de eso
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "Seleccionar fecha";

    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const dayName = dayNames[selectedDate.getDay()];
    const dayNumber = selectedDate.getDate();
    const monthName = monthNames[selectedDate.getMonth()];

    return `${dayName}, ${dayNumber} de ${monthName}`;
  };

  // Default colors if not provided
  const colors = themeColors || {
    primary: "text-amber-900",
    secondary: "text-amber-800",
    hover: "hover:bg-amber-100",
    background: "bg-amber-50",
  };

  // Get CSS custom properties for dynamic styling
  const getButtonColors = () => {
    const colorMap = {
      "text-amber-800": {
        bg: "bg-amber-800",
        hoverBg: "hover:bg-amber-900",
      },
      "text-blue-800": {
        bg: "bg-blue-800",
        hoverBg: "hover:bg-blue-900",
      },
      "text-emerald-800": {
        bg: "bg-emerald-800",
        hoverBg: "hover:bg-emerald-900",
      },
      "text-purple-800": {
        bg: "bg-purple-800",
        hoverBg: "hover:bg-purple-900",
      },
      "text-rose-800": {
        bg: "bg-rose-800",
        hoverBg: "hover:bg-rose-900",
      },
      "text-slate-800": {
        bg: "bg-slate-800",
        hoverBg: "hover:bg-slate-900",
      },
      "text-orange-800": {
        bg: "bg-orange-800",
        hoverBg: "hover:bg-orange-900",
      },
      "text-teal-800": {
        bg: "bg-teal-800",
        hoverBg: "hover:bg-teal-900",
      },
    };
    return (
      colorMap[colors.secondary as keyof typeof colorMap] ||
      colorMap["text-amber-800"]
    );
  };

  const buttonColors = getButtonColors();

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={colors.primary}
            style={{ fontFamily: "Kalam, cursive" }}
          >
            Mover Tarea
          </DialogTitle>
          <DialogDescription>
            Selecciona una nueva fecha para mover esta tarea
            manteniendo todos sus detalles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Preview */}
          <div
            className={`p-3 ${colors.background} rounded-lg border border-current/20`}
          >
            <p className="text-sm text-gray-600 mb-1">
              Tarea a mover:
            </p>
            <div className="flex items-center gap-2">
              {task.time && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {task.time}
                </span>
              )}
              <span
                className={`text-lg ${colors.secondary}`}
                style={{ fontFamily: "Caveat, cursive" }}
              >
                {task.text}
              </span>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva fecha
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMove}
              className={`${buttonColors.bg} hover:${buttonColors.hoverBg} text-white`}
              disabled={!selectedDate}
            >
              Mover Tarea
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}