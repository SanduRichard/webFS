const { Feedback, Activity } = require('../models');

/**
 * Serviciu pentru gestionarea conexiunilor WebSocket
 */
class SocketService {
  constructor(io) {
    this.io = io;
    this.activityRooms = new Map(); // Map pentru a ține evidența participanților per activitate
    this.setupEventHandlers();
  }

  /**
   * Configurează event handlers pentru Socket.io
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      // Join activity room
      socket.on('join-activity', async (data) => {
        await this.handleJoinActivity(socket, data);
      });

      // Leave activity room
      socket.on('leave-activity', (data) => {
        this.handleLeaveActivity(socket, data);
      });

      // Send feedback
      socket.on('send-feedback', async (data) => {
        await this.handleSendFeedback(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handler pentru alăturarea la o activitate
   */
  async handleJoinActivity(socket, { activityId, userRole }) {
    try {
      // Verifică dacă activitatea există și este activă
      const activity = await Activity.findByPk(activityId);
      
      if (!activity) {
        socket.emit('error', { message: 'Activitate negăsită' });
        return;
      }

      if (activity.isExpired()) {
        socket.emit('activity-ended', { activityId });
        return;
      }

      const roomName = `activity-${activityId}`;
      socket.join(roomName);

      // Adaugă socket-ul la evidența activității
      if (!this.activityRooms.has(activityId)) {
        this.activityRooms.set(activityId, new Set());
      }
      this.activityRooms.get(activityId).add(socket.id);

      // Salvează informații despre socket
      socket.activityId = activityId;
      socket.userRole = userRole;

      // Trimite statisticile curente
      const stats = await this.getActivityStats(activityId);
      socket.emit('stats-update', { stats });

      // Anunță numărul de participanți
      const participantCount = this.activityRooms.get(activityId).size;
      this.io.to(roomName).emit('participants-update', { count: participantCount });

    } catch (error) {
      socket.emit('error', { message: 'Eroare la alăturarea la activitate' });
    }
  }

  /**
   * Handler pentru părăsirea unei activități
   */
  handleLeaveActivity(socket, { activityId }) {
    const roomName = `activity-${activityId}`;
    socket.leave(roomName);

    // Elimină din evidență
    if (this.activityRooms.has(activityId)) {
      this.activityRooms.get(activityId).delete(socket.id);
      
      // Anunță numărul actualizat de participanți
      const participantCount = this.activityRooms.get(activityId).size;
      this.io.to(roomName).emit('participants-update', { count: participantCount });
    }
  }

  /**
   * Handler pentru trimiterea feedback-ului
   */
  async handleSendFeedback(socket, { activityId, feedbackType }) {
    try {
      // Verifică dacă activitatea este activă
      const activity = await Activity.findByPk(activityId);
      
      if (!activity || activity.isExpired()) {
        socket.emit('error', { message: 'Activitatea nu mai acceptă feedback' });
        return;
      }

      // Validează tipul de feedback
      const validTypes = ['happy', 'sad', 'surprised', 'confused'];
      if (!validTypes.includes(feedbackType)) {
        socket.emit('error', { message: 'Tip de feedback invalid' });
        return;
      }

      // Salvează feedback-ul în baza de date
      const feedback = await Feedback.create({
        activityId,
        feedbackType,
        timestamp: new Date()
      });

      // Obține statisticile actualizate
      const stats = await this.getActivityStats(activityId);

      // Broadcast către toți din room (inclusiv profesorul)
      const roomName = `activity-${activityId}`;
      this.io.to(roomName).emit('feedback-update', {
        feedback: feedback.toJSON(),
        stats
      });

      // Trimite și un update separat pentru statistici
      this.io.to(roomName).emit('stats-update', { stats });

    } catch (error) {
      socket.emit('error', { message: 'Eroare la trimiterea feedback-ului' });
    }
  }

  /**
   * Handler pentru deconectare
   */
  handleDisconnect(socket) {
    // Elimină din toate room-urile
    if (socket.activityId) {
      const activityId = socket.activityId;
      
      if (this.activityRooms.has(activityId)) {
        this.activityRooms.get(activityId).delete(socket.id);
        
        // Anunță numărul actualizat de participanți
        const roomName = `activity-${activityId}`;
        const participantCount = this.activityRooms.get(activityId).size;
        this.io.to(roomName).emit('participants-update', { count: participantCount });
      }
    }
  }

  /**
   * Calculează statisticile pentru o activitate
   */
  async getActivityStats(activityId) {
    const feedbacks = await Feedback.findAll({
      where: { activityId },
      attributes: ['feedbackType']
    });

    const stats = {
      total: feedbacks.length,
      happy: 0,
      sad: 0,
      surprised: 0,
      confused: 0
    };

    feedbacks.forEach(f => {
      stats[f.feedbackType]++;
    });

    // Calculează procente
    if (stats.total > 0) {
      stats.happyPercent = Math.round((stats.happy / stats.total) * 100);
      stats.sadPercent = Math.round((stats.sad / stats.total) * 100);
      stats.surprisedPercent = Math.round((stats.surprised / stats.total) * 100);
      stats.confusedPercent = Math.round((stats.confused / stats.total) * 100);
    } else {
      stats.happyPercent = 0;
      stats.sadPercent = 0;
      stats.surprisedPercent = 0;
      stats.confusedPercent = 0;
    }

    return stats;
  }

  /**
   * Trimite notificare de expirare a activității
   */
  broadcastActivityEnded(activityId) {
    const roomName = `activity-${activityId}`;
    this.io.to(roomName).emit('activity-ended', { activityId });
  }

  /**
   * Obține numărul de participanți pentru o activitate
   */
  getParticipantCount(activityId) {
    if (this.activityRooms.has(activityId)) {
      return this.activityRooms.get(activityId).size;
    }
    return 0;
  }
}

module.exports = SocketService;
