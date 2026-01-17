import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Conectează la server
   */
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectat la server WebSocket');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Deconectat de la server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Eroare de conexiune:', error);
    });

    return this.socket;
  }

  /**
   * Deconectează de la server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Alătură-te la o cameră de activitate
   */
  joinActivity(activityId, userRole = 'student') {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket.emit('join-activity', { activityId, userRole });
  }

  /**
   * Părăsește camera de activitate
   */
  leaveActivity(activityId) {
    if (this.socket?.connected) {
      this.socket.emit('leave-activity', { activityId });
    }
  }

  /**
   * Trimite feedback
   */
  sendFeedback(activityId, feedbackType) {
    if (this.socket?.connected) {
      this.socket.emit('send-feedback', { activityId, feedbackType });
    }
  }

  /**
   * Ascultă pentru un eveniment
   */
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.on(event, callback);
    
    // Salvează listener-ul pentru cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Elimină listener pentru un eveniment
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Elimină toți listenerii pentru un eveniment
   */
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
    this.listeners.delete(event);
  }

  /**
   * Verifică dacă socket-ul este conectat
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Exportă o instanță singleton
const socketService = new SocketService();
export default socketService;
