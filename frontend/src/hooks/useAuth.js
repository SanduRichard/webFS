import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook pentru accesarea contextului de autentificare
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul unui AuthProvider');
  }
  
  return context;
};

export default useAuth;
