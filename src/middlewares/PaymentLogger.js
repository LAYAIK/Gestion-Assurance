// src/middlewares/paymentLogger.js
import fs from 'fs';
import path from 'path';

// Assurez-vous que le dossier de logs existe
const logDirectory = path.join(process.cwd(), 'logs'); // Ou un chemin absolu plus sûr
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const paymentLogStream = fs.createWriteStream(path.join(logDirectory, 'payment_transactions.log'), { flags: 'a' });

const paymentLogger = (req, res, next) => {
  // Appliquer le middleware uniquement aux méthodes qui modifient l'état des paiements
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.originalUrl.includes('/api/paiements')) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      userId: req.userId || 'N/A', // Récupère l'ID utilisateur si authMiddleware est passé avant
      body: req.body, // Attention: ne logguez pas de données sensibles directement en production
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    // Pour éviter de logger des données sensibles, filtrez ou masquez les champs.
    if (logEntry.body.cardNumber) logEntry.body.cardNumber = '**** **** **** ' + String(logEntry.body.cardNumber).slice(-4);
    if (logEntry.body.cvv) logEntry.body.cvv = '***';
    // Ajoutez d'autres filtres si nécessaire

    paymentLogStream.write(JSON.stringify(logEntry) + '\n');
    console.log(`[PAYMENT_LOG] ${logEntry.timestamp} - ${logEntry.method} ${logEntry.url} by User: ${logEntry.userId}`);
  }
  next();
};

export default paymentLogger;