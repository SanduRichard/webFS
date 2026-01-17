import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [stats, setStats] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  const listenersRef = useRef(new Set());

  // Conectare la socket
  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Verifică starea inițială
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Alătură-te la o activitate
  const joinActivity = useCallback((activityId, userRole = 'student') => {
    socketService.joinActivity(activityId, userRole);
    setCurrentActivity(activityId);

    // Setup listeners pentru activitate
    const handleFeedbackUpdate = (data) => {
      setLastFeedback(data.feedback);
      setStats(data.stats);
    };

    const handleStatsUpdate = (data) => {
      setStats(data.stats);
    };

    const handleParticipantsUpdate = (data) => {
      setParticipantCount(data.count);
    };

    const handleActivityEnded = (data) => {
      if (data.activityId === activityId) {
        setCurrentActivity(null);
      }
    };

    socketService.on('feedback-update', handleFeedbackUpdate);
    socketService.on('stats-update', handleStatsUpdate);
    socketService.on('participants-update', handleParticipantsUpdate);
    socketService.on('activity-ended', handleActivityEnded);

    // Salvează listenerii pentru cleanup
    listenersRef.current.add({ event: 'feedback-update', handler: handleFeedbackUpdate });
    listenersRef.current.add({ event: 'stats-update', handler: handleStatsUpdate });
    listenersRef.current.add({ event: 'participants-update', handler: handleParticipantsUpdate });
    listenersRef.current.add({ event: 'activity-ended', handler: handleActivityEnded });
  }, []);

  // Părăsește activitatea
  const leaveActivity = useCallback((activityId) => {
    socketService.leaveActivity(activityId);
    setCurrentActivity(null);
    setStats(null);
    setParticipantCount(0);
    setLastFeedback(null);

    // Cleanup listeners
    listenersRef.current.forEach(({ event, handler }) => {
      socketService.off(event, handler);
    });
    listenersRef.current.clear();
  }, []);

  // Trimite feedback
  const sendFeedback = useCallback((feedbackType) => {
    if (currentActivity) {
      socketService.sendFeedback(currentActivity, feedbackType);
    }
  }, [currentActivity]);

  // Subscribe la evenimente custom
  const subscribe = useCallback((event, callback) => {
    socketService.on(event, callback);
    return () => socketService.off(event, callback);
  }, []);

  // Cleanup la unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(({ event, handler }) => {
        socketService.off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, []);

  const value = {
    isConnected,
    currentActivity,
    stats,
    participantCount,
    lastFeedback,
    joinActivity,
    leaveActivity,
    sendFeedback,
    subscribe
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
