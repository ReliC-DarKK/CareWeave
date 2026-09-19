import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * CareWeave — Protected Route Component
 *
 * Enforces route-level access control on the client side.
 * Ensures that unauthenticated users are redirected to the login page,
 * and restricts views to specified roles when configured.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Route view component(s) to render if access checks pass.
 * @param {string[]} [props.allowedRoles] - Optional array of authorized roles for this view.
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Avoid flashing protected screens while session state is resolving
  if (isLoading) {
    return null;
  }

  // Redirect unauthenticated users to login, preserving target location for post-login redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if specific roles are required
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // NOTE: Frontend role checking here is strictly for user experience / UI routing. Backend must independently enforce authorization on every API endpoint.
    return <Navigate to="/" replace />;
  }

  // Access checks passed
  return children;
}

export default ProtectedRoute;
