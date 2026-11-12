import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col gap-4 max-w-5xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-sm" />
        <div className="h-4 w-72 bg-slate-200 rounded-xs" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="h-24 bg-slate-200 rounded-sm" />
          <div className="h-24 bg-slate-200 rounded-sm" />
          <div className="h-24 bg-slate-200 rounded-sm" />
          <div className="h-24 bg-slate-200 rounded-sm" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

