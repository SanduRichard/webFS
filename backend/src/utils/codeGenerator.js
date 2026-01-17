/**
 * Generează un cod de acces unic pentru activități
 * Format: 6 caractere alfanumerice (litere mari și cifre)
 */
const generateAccessCode = (length = 6) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluse: I, O, 0, 1 pentru claritate
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Verifică formatul unui cod de acces
 */
const isValidAccessCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const pattern = /^[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase());
};

module.exports = {
  generateAccessCode,
  isValidAccessCode
};
