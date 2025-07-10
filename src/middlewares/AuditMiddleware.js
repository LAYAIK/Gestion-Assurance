// src/middlewares/auditMiddleware.js
// Ceci nécessite une bibliothèque pour gérer le contexte d'exécution asynchrone,
// comme `cls-hooked` ou `async-hooks` (Node.js natif).

import { createNamespace } from 'cls-hooked';

// Créer un namespace pour stocker le contexte
const auditNamespace = createNamespace('audit-context');

export const auditContextMiddleware = (req, res, next) => {
  auditNamespace.run(() => {
    // Stocker l'ID de l'utilisateur courant dans le contexte
    // Assurez-vous que req.userId est défini par votre middleware d'authentification
    auditNamespace.set('userId', req.userId);
    next();
  });
};

// Fonction utilitaire pour récupérer le userId du contexte
export const getUserIdFromContext = () => {
  return auditNamespace.get('userId');
};