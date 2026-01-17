import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Afișează loading în timp ce verificăm autentificarea
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Dacă nu e autentificat, redirectează la login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Dacă e specificat un rol și nu corespunde, redirectează
  if (role && user?.role !== role) {
    if (user?.role === 'student') {
      return <Navigate to="/join" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
