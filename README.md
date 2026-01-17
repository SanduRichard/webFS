# Aplicație Feedback Continuu

Platformă web pentru acordarea de feedback continuu în timpul activităților educaționale (cursuri, seminarii), cu actualizare în timp real prin WebSocket.

## Funcționalități

### Pentru Profesori:
- Autentificare și gestionare cont
- Creare activități cu cod unic de acces
- Setare durată activitate
- Vizualizare feedback în timp real (WebSocket)
- Vizualizare statistici și rapoarte
- Istoric activități

### Pentru Studenți:
- Acces cu cod la activitate activă
- Acordare feedback prin 4 emoticoane
- Feedback nelimitat pe durata activității
- Feedback anonim

## Tehnologii

- **Backend:** Node.js, Express.js, Socket.io, PostgreSQL, Sequelize
- **Frontend:** React 18, Vite, TailwindCSS, Recharts

## Instalare și Rulare

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editează .env cu credențialele PostgreSQL
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Acces
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Licență
MIT
