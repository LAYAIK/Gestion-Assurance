import Utilisateur from "../models/UtilisateurModel.js";
import Role from "../models/RoleModel.js";
import generateToken from "../controllers/GenerateTokenController.js"; // Assurez-vous que le fichier GenerateTokenController.js";
import bcrypt from "bcrypt";


// controlleur d'authentification de utilisateur
async function LoginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis' });
        }
         let emailTrimmed = email.trim().toLowerCase();
        const user = await Utilisateur.findOne({ where: { email : emailTrimmed } });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        if( !user.is_actif && user.date_demande === null) {
            return res.status(403).json({ message: 'Compte inactif, veuillez faire une demande auprés de l\'administrateur' });
        }
        if (!user.is_actif && user.date_demande !== null) {
            return res.status(403).json({ message: 'Compte inactif, veuillez attendre la validation de l\'administrateur' });
        }
        const role = await Role.findByPk(user.id_role);
        const token = generateToken(user.id_utilisateur, role.nom_role);
        res.json({ 
            message: 'Connexion réussie',
            token
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
    
};

// src/controllers/AuthController.js
import jwt from 'jsonwebtoken'; // Assurez-vous d'avoir 'jsonwebtoken' installé
import { addTokenToBlacklist } from '../services/TokenBlacklistService.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwtConfig.js';


const logout = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
    }

    // Décoder le token pour obtenir sa date d'expiration (exp)
    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.exp) {
      return res.status(400).json({ message: 'Invalid token or missing expiration' });
    }

    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes
    const expiresIn = decodedToken.exp - currentTime;

    if (expiresIn > 0) {
      addTokenToBlacklist(token, expiresIn);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
    
export { LoginController , logout };
