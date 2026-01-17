/**
 * Formatează timpul rămas în format MM:SS
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formatează data în format românesc
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatează data relativă (acum 5 minute, etc.)
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Acum';
  if (diff < 3600) return `Acum ${Math.floor(diff / 60)} minute`;
  if (diff < 86400) return `Acum ${Math.floor(diff / 3600)} ore`;
  return formatDate(dateString);
};

/**
 * Emoji-uri pentru feedback
 */
export const feedbackEmojis = {
  happy: '😊',
  sad: '😢',
  surprised: '😲',
  confused: '😕'
};

/**
 * Culori pentru feedback
 */
export const feedbackColors = {
  happy: '#10B981',
  sad: '#EF4444',
  surprised: '#F59E0B',
  confused: '#8B5CF6'
};

/**
 * Labels pentru feedback
 */
export const feedbackLabels = {
  happy: 'Înțeleg',
  sad: 'Nu înțeleg',
  surprised: 'Interesant',
  confused: 'Confuz'
};

/**
 * Validare email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validare cod de acces
 */
export const isValidAccessCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const pattern = /^[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase());
};

/**
 * Generează culoare bazată pe procent
 */
export const getColorByPercent = (percent) => {
  if (percent >= 70) return '#10B981'; // verde
  if (percent >= 40) return '#F59E0B'; // galben
  return '#EF4444'; // roșu
};

/**
 * Calculează scorul general de satisfacție
 */
export const calculateSatisfactionScore = (stats) => {
  if (!stats || stats.total === 0) return 0;
  
  const positiveWeight = stats.happy * 1 + stats.surprised * 0.5;
  const negativeWeight = stats.sad * 1 + stats.confused * 0.5;
  const total = stats.total;
  
  const score = ((positiveWeight - negativeWeight + total) / (2 * total)) * 100;
  return Math.round(Math.max(0, Math.min(100, score)));
};
