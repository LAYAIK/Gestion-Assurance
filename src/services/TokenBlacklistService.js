// src/services/TokenBlacklistService.js (Exemple avec un Set en mémoire pour la démo, utiliser Redis ou DB en production)
const revokedTokens = new Set();

const addTokenToBlacklist = (token, expiresIn) => {
  revokedTokens.add(token);
  // Supprimer le token de la blacklist après son expiration
  setTimeout(() => {
    revokedTokens.delete(token);
  }, expiresIn * 1000); // expiresIn est en secondes, setTimeout en ms
};

const isTokenBlacklisted = (token) => {
  return revokedTokens.has(token);
};

export { addTokenToBlacklist, isTokenBlacklisted };