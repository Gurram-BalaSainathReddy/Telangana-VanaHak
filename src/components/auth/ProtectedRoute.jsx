import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { AlertCircle } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoadingAuth } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoadingAuth && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      base44.auth.redirectToLogin(window.location.pathname);
    }
  }, [user, isLoadingAuth]);

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Your role: <span className="font-semibold">{user.role?.replace(/_/g, ' ')}</span>
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="text-primary hover:underline text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}