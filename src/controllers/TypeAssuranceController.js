// src/controllers/TypeAssController.js
import TypeAssurance from '../models/TypeAssuranceModel.js';
import { Op } from 'sequelize';

// @desc    Créer un nouveau type d'assurance
// @route   POST /api/types-assurance
// @access  Private/Admin
export const createTypeAssurance = async (req, res) => {
  const { nom } = req.body;

  if (!nom) {
    return res.status(400).json({ message: 'Le nom du type d\'assurance est obligatoire.' });
  }

  try {
    const typeExists = await TypeAssurance.findOne({ where: { nom } });
    if (typeExists) {
      return res.status(400).json({ message: 'Un type d\'assurance avec ce nom existe déjà.' });
    }

    const newTypeAss = await TypeAssurance.create({ nom });

    res.status(201).json({ message: 'Type d\'assurance créé avec succès.', typeAss: newTypeAss });
  } catch (error) {
    console.error('Erreur lors de la création du type d\'assurance:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ce nom de type d\'assurance est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation des données.', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création du type d\'assurance.' });
  }
};

// @desc    Obtenir tous les types d'assurance
// @route   GET /api/types-assurance
// @access  Private/Agent, Admin
export const getAllTypesAssurance = async (req, res) => {
  try {
    const typesAss = await TypeAssurance.findAll({
      order: [['nom', 'ASC']]
    });
    res.status(200).json(typesAss);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les types d\'assurance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des types d\'assurance.' });
  }
};

// @desc    Obtenir un type d'assurance par ID
// @route   GET /api/types-assurance/:id
// @access  Private/Agent, Admin
export const getTypeAssuranceById = async (req, res) => {
  try {
    const typeAss = await TypeAssurance.findByPk(req.params.id);

    if (!typeAss) {
      return res.status(404).json({ message: 'Type d\'assurance non trouvé.' });
    }
    res.status(200).json(typeAss);
  } catch (error) {
    console.error('Erreur lors de la récupération du type d\'assurance par ID:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du type d\'assurance.' });
  }
};

// @desc    Mettre à jour un type d'assurance
// @route   PUT /api/types-assurance/:id
// @access  Private/Admin
export const updateTypeAssurance = async (req, res) => {
  const { nom } = req.body;

  if (!nom) {
    return res.status(400).json({ message: 'Le nom du type d\'assurance est obligatoire pour la mise à jour.' });
  }

  try {
    const typeAss = await TypeAssurance.findByPk(req.params.id);

    if (!typeAss) {
      return res.status(404).json({ message: 'Type d\'assurance non trouvé.' });
    }

    // Vérifier si le nouveau nom est déjà pris par un autre type d
    const typeWithSameName = await TypeAssurance.findOne({
      where: {
        nom,
        id_type_ass: { [Op.ne]: req.params.id }
      }
    });
    if (typeWithSameName) {
      return res.status(400).json({ message: 'Ce nom de type d\'assurance est déjà utilisé.' });
    }

    typeAss.nom = nom;
    await typeAss.save();

    res.status(200).json({ message: 'Type d\'assurance mis à jour avec succès.', typeAss });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type d\'assurance:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ce nom de type d\'assurance est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du type d\'assurance.' });
  }
};

// @desc    Supprimer un type d'assurance
// @route   DELETE /api/types-assurance/:id
// @access  Private/Admin
export const deleteTypeAssurance = async (req, res) => {
  try {
    const typeAss = await TypeAssurance.findByPk(req.params.id);

    if (!typeAss) {
      return res.status(404).json({ message: 'Type d\'assurance non trouvé.' });
    }

    // TODO: Ajouter une logique de vérification ici
    // Par exemple, ne pas permettre la suppression si des contrats d'assurance y sont encore liés.
    // Vous devrez peut-être définir une option onDelete: 'SET NULL' ou 'CASCADE' dans l'association
    // ContratAss -> TypeAssurance si vous voulez autoriser la suppression et gérer les contrats liés.

    await typeAss.destroy();
    res.status(200).json({ message: 'Type d\'assurance supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'assurance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du type d\'assurance.' });
  }
};
