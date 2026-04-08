import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { SettingsProvider } from '@/lib/SettingsContext';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Claims from './pages/Claims';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/MapView" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
        <Route path="/Claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
        <Route path="/Analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/AIAssistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/UserManagement" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SettingsProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </SettingsProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App