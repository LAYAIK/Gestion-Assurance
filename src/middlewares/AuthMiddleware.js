import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwtConfig.js';
import Utilisateur from '../models/UtilisateurModel.js';

// Middleware pour protéger les routes (vérifier le token)
 const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token (ignorer "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Chercher l'utilisateur dans la base de données (sans son mot de passe)
      req.user = await Utilisateur.findByPk(decoded.id_utilisateur, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé.' });
      }

      next(); // Passer au middleware ou contrôleur suivant

    } catch (error) {
      console.error('Erreur de validation du token:', error.message);
      return res.status(401).json({ message: 'Non autorisé, token invalide ou expiré.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token fourni.' });
  }
};

// Middleware pour restreindre l'accès basé sur les rôles
const authorize = (...roles) => { // Prend un tableau de rôles autorisés (ex: 'admin', 'agent')
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé, vous n\'avez pas la permission pour cette action.' });
    }
    next();
  };
};

export { protect, authorize }; // Exporter les middlewares pour les utiliser dans les routes
