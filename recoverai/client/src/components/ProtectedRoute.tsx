import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPersona?: 'USER' | 'MAINTAINER';
  redirectTo?: string;
}

/**
 * Route guard that checks the user's persona before rendering.
 * - If not authenticated → redirects to /login
 * - If persona doesn't match → redirects to appropriate dashboard
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPersona,
  redirectTo,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPersona && (user as any).persona !== requiredPersona) {
    const fallback =
      redirectTo ??
      ((user as any).persona === 'MAINTAINER' ? '/dashboard' : '/admin');
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
