import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Play, Pause } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
  existingAudio?: string;
  isEditing?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, onCancel, existingAudio, isEditing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio || null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (existingAudio) {
      setAudioUrl(existingAudio);
    }
  }, [existingAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        
        // Limpiar el stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer para mostrar tiempo de grabación
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Asegúrate de haber dado permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      audio.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-amber-900">
          {isEditing ? 'Editar Nota de Voz' : 'Nueva Nota de Voz'}
        </h3>
        {isEditing && (
          <p className="text-sm text-amber-700 mt-1">
            ⚠️ Esto reemplazará la nota de voz actual
          </p>
        )}
      </div>

      {/* Área de grabación */}
      <div className="bg-amber-50 rounded-lg p-4 text-center">
        {isRecording ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-red-600 font-medium">Grabando...</p>
            <p className="text-2xl font-mono text-red-600">{formatTime(recordingTime)}</p>
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Detener
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!audioUrl ? (
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-amber-700" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                    <Mic className="w-8 h-8 text-green-700" />
                  </div>
                </div>
                <p className="text-green-600 font-medium">✓ Nota de voz lista</p>
              </div>
            )}
            
            <Button
              onClick={startRecording}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              {audioUrl ? 'Grabar nueva' : 'Iniciar grabación'}
            </Button>
          </div>
        )}
      </div>

      {/* Reproductor de audio */}
      {audioUrl && !isRecording && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-green-700 font-medium">Vista previa:</span>
            <Button
              onClick={isPlaying ? pauseAudio : playAudio}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={onCancel}
          variant="outline"
          className="text-gray-600 border-gray-300"
        >
          Cancelar
        </Button>
        {audioUrl && (
          <Button
            onClick={() => {
              // Convertir audioUrl a blob si es necesario
              fetch(audioUrl)
                .then(res => res.blob())
                .then(blob => onRecordingComplete(blob));
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
}