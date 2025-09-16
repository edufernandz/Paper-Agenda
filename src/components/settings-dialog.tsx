import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Settings, Palette, Type, Users, Share, Copy, Check, UserPlus, UserMinus } from 'lucide-react';

export interface UserSettings {
  headerType: 'custom' | 'year';
  textColor: 'amber' | 'blue' | 'green' | 'purple' | 'rose' | 'slate' | 'orange' | 'teal';
  backgroundColor: 'cream' | 'white' | 'blue' | 'green' | 'purple' | 'rose' | 'amber' | 'slate';
  fontFamily: 'kalam' | 'caveat' | 'inter';
  isShared: boolean;
  shareCode?: string;
  connectedUsers: Array<{
    id: string;
    name: string;
    color: string;
    isOwner: boolean;
  }>;
}

interface SettingsDialogProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function SettingsDialog({ settings, onSettingsChange, themeColors }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

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

  const colorThemes = [
    { value: 'amber', name: 'Ámbar', colors: 'from-amber-400 to-amber-600' },
    { value: 'blue', name: 'Azul', colors: 'from-blue-400 to-blue-600' },
    { value: 'green', name: 'Verde', colors: 'from-emerald-400 to-emerald-600' },
    { value: 'purple', name: 'Morado', colors: 'from-purple-400 to-purple-600' },
    { value: 'rose', name: 'Rosa', colors: 'from-rose-400 to-rose-600' },
    { value: 'slate', name: 'Gris', colors: 'from-slate-400 to-slate-600' },
    { value: 'orange', name: 'Naranja', colors: 'from-orange-500 to-red-500' },
    { value: 'teal', name: 'Verde azul', colors: 'from-teal-400 to-cyan-500' },
  ];

  const backgroundColorThemes = [
    { value: 'cream', name: 'Crema (Actual)', colors: 'from-yellow-50 to-amber-50' },
    { value: 'white', name: 'Blanco', colors: 'from-white to-gray-50' },
    { value: 'blue', name: 'Azul claro', colors: 'from-blue-50 to-blue-100' },
    { value: 'green', name: 'Verde claro', colors: 'from-green-50 to-green-100' },
    { value: 'purple', name: 'Morado claro', colors: 'from-purple-50 to-purple-100' },
    { value: 'rose', name: 'Rosa claro', colors: 'from-rose-50 to-rose-100' },
    { value: 'amber', name: 'Ámbar claro', colors: 'from-amber-50 to-amber-100' },
    { value: 'slate', name: 'Gris claro', colors: 'from-slate-50 to-slate-100' },
  ];

  const fontOptions = [
    { value: 'kalam', name: 'Kalam (Actual)', style: 'Kalam, cursive' },
    { value: 'caveat', name: 'Caveat', style: 'Caveat, cursive' },
    { value: 'inter', name: 'Inter', style: 'Inter, sans-serif' },
  ];

  const handleHeaderTypeChange = (value: string) => {
    onSettingsChange({
      ...settings,
      headerType: value as 'custom' | 'year'
    });
  };

  const handleColorChange = (value: string) => {
    onSettingsChange({
      ...settings,
      textColor: value as UserSettings['textColor']
    });
  };

  const handleBackgroundColorChange = (value: string) => {
    onSettingsChange({
      ...settings,
      backgroundColor: value as UserSettings['backgroundColor']
    });
  };

  const handleFontChange = (value: string) => {
    onSettingsChange({
      ...settings,
      fontFamily: value as UserSettings['fontFamily']
    });
  };

  // Funciones para compartir agenda
  const generateShareCode = () => {
    // Generar un código más legible evitando caracteres confusos como 0, O, I, l
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Simular que ya hay algunos usuarios conectados (para demo)
    const simulatedUsers = [
      { id: 'sim1', name: 'Ana García', color: 'bg-blue-500', isOwner: false },
      { id: 'sim2', name: 'Carlos López', color: 'bg-purple-500', isOwner: false }
    ];
    
    // 30% de probabilidad de añadir usuarios simulados
    const shouldAddUsers = Math.random() < 0.3;
    const usersToAdd = shouldAddUsers ? simulatedUsers.slice(0, Math.floor(Math.random() * 2) + 1) : [];
    
    onSettingsChange({
      ...settings,
      isShared: true,
      shareCode: code,
      connectedUsers: [
        ...settings.connectedUsers,
        ...usersToAdd
      ]
    });
  };

  const stopSharing = () => {
    onSettingsChange({
      ...settings,
      isShared: false,
      shareCode: undefined,
      connectedUsers: settings.connectedUsers.filter(user => user.isOwner)
    });
  };

  const copyShareCode = async () => {
    if (!settings.shareCode) return;
    
    // Función fallback mejorada
    const fallbackCopyTextToClipboard = (text: string): boolean => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Hacer que el elemento sea invisible pero funcional
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';  
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // Para dispositivos móviles
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
      }
    };

    let copySuccessful = false;

    // Intentar primero con la API moderna
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(settings.shareCode);
        copySuccessful = true;
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      console.log('Clipboard API failed, trying fallback:', err);
      copySuccessful = fallbackCopyTextToClipboard(settings.shareCode);
    }

    if (copySuccessful) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      console.error('Could not copy code:', settings.shareCode);
      // Mostrar el código en consola como último recurso
      alert(`No se pudo copiar automáticamente. Código: ${settings.shareCode}`);
    }
  };

  const joinAgenda = () => {
    if (joinCode.trim() && joinCode.length === 6) {
      // Generar nombre de usuario aleatorio más realista
      const userNames = [
        'Ana García', 'Carlos López', 'María Rodríguez', 'David Martín', 
        'Elena Fernández', 'Jorge Pérez', 'Laura González', 'Miguel Torres',
        'Sara Ruiz', 'Pablo Díaz', 'Carmen Jiménez', 'Rubén Morales'
      ];
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
        'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'
      ];
      
      const randomName = userNames[Math.floor(Math.random() * userNames.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      console.log('Uniéndose a agenda con código:', joinCode);
      
      // Simular unirse a una agenda compartida
      onSettingsChange({
        ...settings,
        isShared: true,
        shareCode: joinCode.toUpperCase(),
        connectedUsers: [
          ...settings.connectedUsers,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: randomName,
            color: randomColor,
            isOwner: false
          }
        ]
      });
      setJoinCode('');
    }
  };

  const removeUser = (userId: string) => {
    onSettingsChange({
      ...settings,
      connectedUsers: settings.connectedUsers.filter(user => user.id !== userId)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 rounded-full ${hoverColor} ${colors.secondary}`}
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de la Agenda
          </DialogTitle>
          <DialogDescription>
            Personaliza la apariencia y funcionalidad de tu agenda
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto flex-1 px-1 -mx-1">
          {/* Header Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Cabecera
            </Label>
            <Select value={settings.headerType} onValueChange={handleHeaderTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de cabecera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Año actual de la agenda</SelectItem>
                <SelectItem value="custom">Texto personalizable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Theme Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color del texto
            </Label>
            <Select value={settings.textColor} onValueChange={handleColorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un color" />
              </SelectTrigger>
              <SelectContent>
                {colorThemes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.colors}`}></div>
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Color Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color de fondo
            </Label>
            <Select value={settings.backgroundColor} onValueChange={handleBackgroundColorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un color" />
              </SelectTrigger>
              <SelectContent>
                {backgroundColorThemes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.colors}`}></div>
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Family Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Tipografía
            </Label>
            <Select value={settings.fontFamily} onValueChange={handleFontChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una fuente" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.style }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg bg-muted/20">
            <Label className="text-sm text-muted-foreground">Vista previa</Label>
            <div 
              className={`mt-2 p-3 rounded-lg ${settings.backgroundColor === 'white' ? 'bg-white' : 
                settings.backgroundColor === 'blue' ? 'bg-blue-50' :
                settings.backgroundColor === 'green' ? 'bg-green-50' :
                settings.backgroundColor === 'purple' ? 'bg-purple-50' :
                settings.backgroundColor === 'rose' ? 'bg-rose-50' :
                settings.backgroundColor === 'amber' ? 'bg-amber-50' :
                settings.backgroundColor === 'slate' ? 'bg-slate-50' :
                'bg-yellow-50'}`}
            >
              <p 
                className={`text-lg ${settings.textColor === 'amber' ? 'text-amber-900' : 
                  settings.textColor === 'blue' ? 'text-blue-900' :
                  settings.textColor === 'green' ? 'text-emerald-900' :
                  settings.textColor === 'purple' ? 'text-purple-900' :
                  settings.textColor === 'rose' ? 'text-rose-900' :
                  settings.textColor === 'slate' ? 'text-slate-900' :
                  settings.textColor === 'orange' ? 'text-orange-900' :
                  'text-teal-900'}`}
                style={{ 
                  fontFamily: settings.fontFamily === 'kalam' ? 'Kalam, cursive' :
                    settings.fontFamily === 'caveat' ? 'Caveat, cursive' :
                    'Inter, sans-serif'
                }}
              >
                {settings.headerType === 'custom' ? 'Mi Agenda Personalizada' : 'Mi Agenda'}
              </p>
            </div>
          </div>

          {/* Compartir Agenda */}
          <Separator />
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Share className="w-4 h-4" />
              Compartir Agenda
            </Label>
            
            {!settings.isShared ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Permite que otras personas vean y editen esta agenda
                </p>
                <Button 
                  onClick={generateShareCode}
                  className={`${colors.background} ${colors.secondary} ${colors.hover}`}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Generar código de compartir
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">Código de compartir:</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={settings.shareCode || ''} 
                      readOnly 
                      className="font-mono text-center bg-gray-50 text-lg font-bold select-all cursor-pointer"
                      onClick={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.select();
                        input.setSelectionRange(0, 99999);
                      }}
                      title="Haz clic para seleccionar todo el código"
                    />
                    <Button 
                      onClick={async (e) => {
                        const inputElement = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                        if (!inputElement?.value) return;
                        
                        const textToCopy = inputElement.value;
                        
                        // Función fallback mejorada
                        const fallbackCopyTextToClipboard = (text: string): boolean => {
                          try {
                            const textArea = document.createElement('textarea');
                            textArea.value = text;
                            
                            // Hacer que el elemento sea invisible pero funcional
                            textArea.style.position = 'fixed';
                            textArea.style.top = '0';
                            textArea.style.left = '0';  
                            textArea.style.width = '2em';
                            textArea.style.height = '2em';
                            textArea.style.padding = '0';
                            textArea.style.border = 'none';
                            textArea.style.outline = 'none';
                            textArea.style.boxShadow = 'none';
                            textArea.style.background = 'transparent';
                            textArea.style.opacity = '0';
                            textArea.style.pointerEvents = 'none';
                            
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            textArea.setSelectionRange(0, 99999); // Para dispositivos móviles
                            
                            const successful = document.execCommand('copy');
                            document.body.removeChild(textArea);
                            return successful;
                          } catch (err) {
                            console.error('Fallback copy failed:', err);
                            return false;
                          }
                        };

                        let copySuccessful = false;

                        // Intentar primero con la API moderna
                        try {
                          if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText(textToCopy);
                            copySuccessful = true;
                          } else {
                            throw new Error('Clipboard API not available');
                          }
                        } catch (err) {
                          console.log('Clipboard API failed, trying fallback:', err);
                          copySuccessful = fallbackCopyTextToClipboard(textToCopy);
                        }

                        if (copySuccessful) {
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        } else {
                          console.error('Could not copy code:', textToCopy);
                          // Mostrar el código en consola como último recurso
                          alert(`No se pudo copiar automáticamente. Código: ${textToCopy}`);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="px-3 min-w-[44px]"
                      title={isCopied ? "¡Copiado!" : "Copiar código"}
                    >
                      {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Comparte este código con otros para que se unan a tu agenda.
                    <br />
                    <span className="text-amber-700 font-medium">💡 Tip: Haz clic en el código para seleccionarlo y copiarlo manualmente</span>
                  </p>
                </div>
                
                <Button 
                  onClick={stopSharing}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Dejar de compartir
                </Button>
              </div>
            )}

            {/* Unirse a otra agenda */}
            <div className="space-y-3">
              <Label className="text-sm">O únete a una agenda existente:</Label>
              <div className="flex gap-2">
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Código de 6 caracteres"
                  className="font-mono text-center"
                  maxLength={6}
                />
                <Button 
                  onClick={joinAgenda}
                  disabled={joinCode.length !== 6}
                  size="sm"
                  className={`${colors.background} ${colors.secondary} hover:opacity-80`}
                >
                  Unirse
                </Button>
              </div>
            </div>

            {/* Usuarios conectados */}
            {settings.connectedUsers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuarios conectados ({settings.connectedUsers.length})
                </Label>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {settings.connectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${user.color}`}></div>
                        <span className="text-sm">{user.name}</span>
                        {user.isOwner && (
                          <Badge variant="secondary" className="text-xs">
                            Propietario
                          </Badge>
                        )}
                      </div>
                      {!user.isOwner && (
                        <Button 
                          onClick={() => removeUser(user.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}