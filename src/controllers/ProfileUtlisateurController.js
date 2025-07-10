import Utilisateur from "../models/UtilisateurModel.js";
import { Op } from "sequelize";
import  generateToken from "./GenerateTokenController.js";


// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/profile
// @access  Private (nécessite un token)
const getProfileController = async (req, res) => {
  try {
    // L'ID de l'utilisateur est ajouté à req.user par le middleware d'authentification
    const utilisateur = await Utilisateur.findByPk(req.user.id_utilisateur, {
      attributes: { exclude: ['password'] } // Ne pas retourner le mot de passe haché
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Profil utilisateur non trouvé.' });
    }

    res.status(200).json({
      id: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      email: utilisateur.email,
      id_role: utilisateur.id_role,
      createdAt: utilisateur.createdAt,
      updatedAt: utilisateur.updatedAt
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/auth/profile
// @access  Private (nécessite un token)
const updateProfileController = async (req, res) => {
  const { nom, email, password } = req.body; // Ne pas permettre la modification du rôle via le profil

  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id_utilisateur);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Profil utilisateur non trouvé.' });
    }

    // Mettre à jour les champs si fournis
    if (nom) utilisateur.nom = nom;
    if (email) {
      // Vérifier si le nouvel email est déjà pris par un autre utilisateur
      const userWithSameEmail = await Utilisateur.findOne({
        where: {
          email,
          id_utilisateur: { [Op.ne]: req.user.id_utilisateur } // Exclure l'utilisateur actuel
        }
      });
      if (userWithSameEmail) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre compte.' });
      }
      utilisateur.email = email;
    }
    if (password) {
      // Le hook beforeUpdate du modèle Utilisateur gérera le hachage
      utilisateur.password = password; // Le mot de passe sera haché automatiquement
    }

    await utilisateur.save();

    // Re-générer le token si l'email ou d'autres informations importantes changent (optionnel)
    const token = generateToken(utilisateur.id_utilisateur, utilisateur.id_role);

    res.status(200).json({
      message: 'Profil mis à jour avec succès.',
      id: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      email: utilisateur.email,
      role: utilisateur.id_role,
      token // Renvoyer un nouveau token si l'ancien est invalidé
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil.' });
  }
};


export {
  getProfileController,
  updateProfileController
};
