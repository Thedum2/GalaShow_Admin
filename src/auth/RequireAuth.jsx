import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireAuth() {
  const { isAuthed, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null; // 또는 스피너
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
