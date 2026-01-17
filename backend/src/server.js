require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initializeDatabase } = require('./models');
const SocketService = require('./services/socketService');

const PORT = process.env.PORT || 3000;

// Creare server HTTP
const server = http.createServer(app);

// Configurare Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inițializare serviciu Socket
const socketService = new SocketService(io);

// Expune socketService pentru a fi folosit în alte părți ale aplicației
app.set('socketService', socketService);
app.set('io', io);

// Pornire server
const startServer = async () => {
  try {
    // Inițializare bază de date
    await initializeDatabase();
    
    // Pornire server HTTP
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Feedback App Server                                   ║
║                                                            ║
║   Server:    http://localhost:${PORT}                        ║
║   API:       http://localhost:${PORT}/api                    ║
║   WebSocket: ws://localhost:${PORT}                          ║
║   Health:    http://localhost:${PORT}/health                 ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Eroare la pornirea serverului:', error);
    process.exit(1);
  }
};

// Gestionare închidere grațioasă
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

// Pornire
startServer();
