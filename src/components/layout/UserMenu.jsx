import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';

const roleColors = {
  government_admin: 'bg-red-100 text-red-700',
  district_officer: 'bg-blue-100 text-blue-700',
  public_user: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
  user: 'bg-green-100 text-green-700',
};

const roleLabels = {
  government_admin: 'Government Admin',
  district_officer: 'District Officer',
  public_user: 'Public User',
  admin: 'Admin',
  user: 'User',
};

export default function UserMenu() {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!user) return null;

  const name = user.display_name || user.full_name || '';
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-sidebar-accent/50 rounded-lg px-2 py-1.5 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-sidebar-foreground">{name || 'User'}</p>
              <p className="text-[10px] text-sidebar-foreground/60">{user.email}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="space-y-1">
              <p className="text-sm font-medium">{name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge className={`text-[10px] ${roleColors[user.role] || 'bg-muted text-muted-foreground'}`}>
                <Shield className="w-3 h-3 mr-1" />
                {roleLabels[user.role] || user.role}
              </Badge>
              {user.district && (
                <p className="text-[10px] text-muted-foreground">District: {user.district}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => base44.auth.logout('/')} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}