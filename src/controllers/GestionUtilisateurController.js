import Utilisateur from '../models/UtilisateurModel.js';
import { Op } from 'sequelize';


// La gestion des utilisateurs est faite par l'administrateur, donc pas de vérification de mot de passe ici

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      attributes: { exclude: ['password'] } // Exclure le mot de passe des résultats
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs.' });
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id_utilisateur, {
      attributes: { exclude: ['password'] } // Exclure le mot de passe des résultats
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'utilisateur.' });
  }
};

// @desc    Mettre à jour un utilisateur (par Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const { role, id_compagnie } = req.body;

  try {
    const user = await Utilisateur.findByPk(req.params.id_utilisateur);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Mettre à jour les champs

    if (role) user.role = role;
    if (id_compagnie !== undefined) user.id_compagnie = id_compagnie; // Permet de mettre à null

    await user.save();

    res.status(200).json({ message: 'Utilisateur mis à jour avec succès.', user });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'utilisateur.' });
  }
};

// @desc    Supprimer un utilisateur (par Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
 const deleteUser = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id_utilisateur);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur.' });
  }
};

export { getUsers, getUserById, updateUser, deleteUser };
