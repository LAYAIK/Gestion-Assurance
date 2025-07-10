// src/middlewares/errorHandler.js

// Définir des classes d'erreurs personnalisées pour les cas spécifiques
export class PaymentGatewayError extends Error {
  constructor(message, originalError = null, statusCode = 502) {
    super(message);
    this.name = 'PaymentGatewayError';
    this.originalError = originalError; // Garder la trace de l'erreur originale de la passerelle
    this.statusCode = statusCode; // Ex: 502 Bad Gateway pour une erreur de communication
  }
}

export class InvalidPaymentDataError extends Error {
  constructor(message, originalError = null, statusCode = 400) {
    super(message);
    this.name = 'InvalidPaymentDataError';
    this.originalError = originalError;
    this.statusCode = statusCode; // 400 Bad Request
  }
}

export class PaymentProcessingError extends Error {
  constructor(message, originalError = null, statusCode = 500) {
    super(message);
    this.name = 'PaymentProcessingError';
    this.originalError = originalError;
    this.statusCode = statusCode; // 500 Internal Server Error
  }
}


// Le middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  // Par défaut, l'erreur est une erreur interne du serveur
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Une erreur interne du serveur est survenue.';

  // Logguer l'erreur pour le débogage (en production, utilisez un logger plus robuste comme Winston/Pino)
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.name || 'Error'}: ${err.message}`);
  if (err.originalError) {
    console.error('Original Error:', err.originalError);
  }
  console.error(err.stack); // Pour voir la pile d'appels

  // Gérer des types d'erreurs spécifiques (si vous n'avez pas de classes personnalisées)
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors ? err.errors.map(e => e.message).join(', ') : 'Erreur de validation des données.';
  } else if (err.name === 'NotFoundError') { // Erreur personnalisée que vos services pourraient lancer
    statusCode = 404;
    message = err.message;
  } else if (err.name === 'ForbiddenError') { // Erreur personnalisée pour les autorisations
    statusCode = 403;
    message = err.message;
  }

  // Pour les erreurs de paiement personnalisées
  if (err instanceof PaymentGatewayError) {
    statusCode = err.statusCode;
    message = `Erreur de passerelle de paiement: ${err.message}`;
  } else if (err instanceof InvalidPaymentDataError) {
    statusCode = err.statusCode;
    message = `Données de paiement invalides: ${err.message}`;
  } else if (err instanceof PaymentProcessingError) {
    statusCode = err.statusCode;
    message = `Erreur de traitement du paiement: ${err.message}`;
  }


  // Envoyer la réponse d'erreur au client
  res.status(statusCode).json({
    success: false,
    message: message,
    // En production, évitez d'envoyer les détails complets de l'erreur (stack trace)
    // error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;