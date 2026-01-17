import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * Hook pentru accesarea contextului Socket.io
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket trebuie folosit în interiorul unui SocketProvider');
  }
  
  return context;
};

export default useSocket;
