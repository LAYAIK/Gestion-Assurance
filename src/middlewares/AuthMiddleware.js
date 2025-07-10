import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwtConfig.js';
import Utilisateur from '../models/UtilisateurModel.js';
import Role from '../models/RoleModel.js';

// Middleware pour protéger les routes (vérifier le token)
 const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token (ignorer "Bearer ")
      token = req.headers.authorization.split(' ')[1];
      //console.log('token du swagger:', token);
      // Vérifier le token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Chercher l'utilisateur dans la base de données (sans son mot de passe)
      const user = await Utilisateur.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      const role = await Role.findByPk(user.id_role);
      req.user = {
        id: decoded.id,
        role: role.nom_role,
      }; // Attache un nouvel objet avec seulement l'id et le rôle

      if (!req.user) {
        return res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé.' });
      }
      req.userId = decoded.id; // Stocker l'ID de l'utilisateur dans la requête
      next(); // Passer au middleware ou contrôleur suivant

    } catch (error) {
      console.error('Erreur de validation du token:', error.message);
      return res.status(401).json({ message: 'Non autorisé, token invalide ou expiré.' });
    }
  } else {
    return res.status(401).json({ message: 'Non autorisé, pas de token fourni.' });
  } 
};

// Middleware pour restreindre l'accès basé sur les rôles

const authorize = (...roles) => { // Prend un tableau de rôles autorisés (ex: 'admin', 'agent')
  return (req, res, next) => {
  console.log('User role from token:', req.user.role); // Vérifiez ce qui est extrait du token
  console.log('Allowed roles for this route:', roles); // Vérifiez les rôles attendus
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé, vous n\'avez pas la permission pour cette action.' });
    }
    next();
  };
};

// src/middleware/authMiddleware.js (Mise à jour pour vérifier la blacklist)
import { isTokenBlacklisted } from '../services/TokenBlacklistService.js';
// ... autres imports et logiques d'authentification ...

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Pas de token

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been revoked' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403); // Token invalide ou expiré
    req.user = user;
    next();
  });
};

export { protect, authorize, authenticateToken };


