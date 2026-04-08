import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, FileText, BarChart3, Bot, TreePine, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext';
import UserMenu from './UserMenu';

const navItems = [
  { path: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['government_admin', 'district_officer', 'public_user'] },
  { path: '/MapView', label: 'GIS Map', icon: Map, roles: ['government_admin', 'district_officer', 'public_user'] },
  { path: '/Claims', label: 'Claims', icon: FileText, roles: ['government_admin', 'district_officer', 'public_user'] },
  { path: '/Analytics', label: 'Analytics', icon: BarChart3, roles: ['government_admin', 'district_officer'] },
  { path: '/AIAssistant', label: 'AI Assistant', icon: Bot, roles: ['government_admin', 'district_officer', 'public_user'] },
  { path: '/UserManagement', label: 'Users', icon: Users, roles: ['government_admin'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();

  // Show all items if no user (during auth) or filter by role
  const visibleItems = !user 
    ? navItems 
    : navItems.filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <TreePine className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">FRA Monitor</h1>
            <p className="text-[10px] text-sidebar-foreground/60">Telangana WebGIS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="px-2 pb-3 border-t border-sidebar-border pt-3">
        <UserMenu />
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="mx-2 mb-4 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}