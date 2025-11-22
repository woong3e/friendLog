import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const ProtectedRoute = () => {
  const { session, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
