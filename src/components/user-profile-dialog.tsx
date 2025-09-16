import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import { User, Camera, LogOut, Mail, UserCheck } from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarColor: string;
}

interface UserProfileDialogProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onLogout: () => void;
  themeColors?: {
    primary: string;
    secondary: string;
    hover: string;
    background: string;
  };
}

export function UserProfileDialog({ profile, onProfileChange, onLogout, themeColors }: UserProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
    'bg-yellow-500', 'bg-cyan-500', 'bg-rose-500', 'bg-violet-500'
  ];

  const handleSave = () => {
    onProfileChange(editingProfile);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditingProfile(profile);
    setIsOpen(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditingProfile(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarColorChange = (color: string) => {
    setEditingProfile(prev => ({ ...prev, avatarColor: color, avatar: undefined }));
  };

  const handleRemoveAvatar = () => {
    setEditingProfile(prev => ({ ...prev, avatar: undefined }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`absolute top-2 sm:top-4 left-2 sm:left-4 p-1.5 sm:p-2 rounded-full ${hoverColor} ${colors.secondary}`}
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Perfil de Usuario
          </DialogTitle>
          <DialogDescription>
            Gestiona tu información personal y configuración de cuenta
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto flex-1 px-1 -mx-1">
          {/* Avatar Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Foto de perfil
            </Label>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                {editingProfile.avatar ? (
                  <img 
                    src={editingProfile.avatar} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full ${editingProfile.avatarColor} flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200`}>
                    {getInitials(editingProfile.name)}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Camera className="w-3 h-3 mr-1" />
                  Subir foto
                </Button>
                
                {editingProfile.avatar && (
                  <Button 
                    onClick={handleRemoveAvatar}
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Quitar foto
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Avatar Color Selection */}
            {!editingProfile.avatar && (
              <div className="space-y-2">
                <Label className="text-sm">Color de avatar:</Label>
                <div className="flex flex-wrap gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleAvatarColorChange(color)}
                      className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                        editingProfile.avatarColor === color 
                          ? 'border-gray-800 scale-110' 
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      title={`Seleccionar color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Información personal
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="profile-name" className="text-sm">Nombre completo</Label>
                <Input
                  id="profile-name"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="profile-email" className="text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Account Actions */}
          <Separator />
          <div className="space-y-3">
            <Label className="text-base font-medium">Cuenta</Label>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Podrás iniciar sesión con otra cuenta o crear una nueva
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className={`${colors.background} ${colors.secondary} ${colors.hover}`}
            disabled={!editingProfile.name.trim() || !editingProfile.email.trim()}
          >
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}