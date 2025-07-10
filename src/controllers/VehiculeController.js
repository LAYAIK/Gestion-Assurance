// src/controllers/VehiculeController.js
import Vehicule from '../models/VehiculeModel.js';
import ContratAssurance from '../models/ContratAssuranceModel.js';
import { Op } from 'sequelize';


export const createVehicule = async (req, res) => {
  const { immatriculation, marque, modele, annee_fabrication, numero_chassis, couleur } = req.body;

  if (!immatriculation || !marque || !modele || !id_police) {
    return res.status(400).json({ message: 'L\'immatriculation, la marque, le modèle et l\'ID de la police sont obligatoires.' });
  }

  try {
    // Vérifier l'existence de la police d'assurance
    const contrat = await ContratAssurance.findByPk(id_police);
    if (!contrat) {
      return res.status(400).json({ message: 'La police d\'assurance spécifiée n\'existe pas.' });
    }

    // Vérifier si l'immatriculation ou le numéro de châssis existe déjà
    const existingVehicule = await Vehicule.findOne({
      where: {
        [Op.or]: [{ immatriculation }, { numero_chassis }]
      }
    });

    if (existingVehicule) {
      if (existingVehicule.immatriculation === immatriculation) {
        return res.status(400).json({ message: 'Un véhicule avec cette immatriculation existe déjà.' });
      }
      if (existingVehicule.numero_chassis === numero_chassis) {
        return res.status(400).json({ message: 'Un véhicule avec ce numéro de châssis existe déjà.' });
      }
    }

    const newVehicule = await Vehicule.create({
      immatriculation,
      marque,
      modele,
      annee_fabrication: annee_fabrication || null,
      numero_chassis: numero_chassis || null,
      couleur: couleur || null,
      id_police
    });

    res.status(201).json({ message: 'Véhicule enregistré avec succès.', vehicule: newVehicule });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du véhicule:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({ message: `Le champ '${field}' est déjà utilisé.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation des données.', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du véhicule.' });
  }
};

export const getAllVehicules = async (req, res) => {
  const { id_police } = req.query; // Permettre de filtrer par id_police

  let whereClause = {};
  if (id_police) {
    whereClause.id_police = id_police;
  }

  try {
    const vehicules = await Vehicule.findAll({
      where: whereClause,
      order: [['immatriculation', 'ASC']],
      include: [ // Inclure les détails du contrat associé
        { model: ContratAssurance, as: 'contrat_assurance', attributes: ['id_police', 'numero_contrat', 'statut'] }
      ]
    });
    res.status(200).json(vehicules);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les véhicules:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des véhicules.' });
  }
};


export const getVehiculeById = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.immatriculation, {
      include: [
        { model: ContratAssurance, as: 'contrat_assurance', attributes: ['id_police', 'numero_contrat', 'statut'] }
      ]
    });

    if (!vehicule) {
      return res.status(404).json({ message: 'Véhicule non trouvé.' });
    }
    res.status(200).json(vehicule);
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule par immatriculation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du véhicule.' });
  }
};

export const updateVehicule = async (req, res) => {
  const { marque, modele, annee_fabrication, numero_chassis, couleur, id_police } = req.body;
  const { immatriculation } = req.params;

  try {
    const vehicule = await Vehicule.findByPk(immatriculation);

    if (!vehicule) {
      return res.status(404).json({ message: 'Véhicule non trouvé.' });
    }

    // Si numero_chassis est fourni et différent, vérifier l'unicité
    if (numero_chassis && numero_chassis !== vehicule.numero_chassis) {
      const existingChassis = await Vehicule.findOne({
        where: { numero_chassis, immatriculation: { [Op.ne]: immatriculation } }
      });
      if (existingChassis) {
        return res.status(400).json({ message: 'Un véhicule avec ce numéro de châssis existe déjà.' });
      }
      vehicule.numero_chassis = numero_chassis;
    }

    // Si id_police est fourni et différent, vérifier l'existence de la nouvelle police
    if (id_police && id_police !== vehicule.id_police) {
      const contrat = await ContratAssurance.findByPk(id_police);
      if (!contrat) {
        return res.status(400).json({ message: 'La nouvelle police d\'assurance spécifiée n\'existe pas.' });
      }
      vehicule.id_police = id_police;
    }

    // Mettre à jour les autres champs
    if (marque) vehicule.marque = marque;
    if (modele) vehicule.modele = modele;
    if (annee_fabrication !== undefined) vehicule.annee_fabrication = annee_fabrication;
    if (couleur !== undefined) vehicule.couleur = couleur;

    await vehicule.save();

    res.status(200).json({ message: 'Véhicule mis à jour avec succès.', vehicule });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({ message: `Le champ '${field}' est déjà utilisé.` });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du véhicule.' });
  }
};

export const deleteVehicule = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.immatriculation);

    if (!vehicule) {
      return res.status(404).json({ message: 'Véhicule non trouvé.' });
    }

    // TODO: Implémenter ici une logique de vérification ou de suppression en cascade
    // Par exemple, si d'autres entités dépendent du véhicule (sinistres spécifiques liés au véhicule).

    await vehicule.destroy();
    res.status(200).json({ message: 'Véhicule supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du véhicule.' });
  }
};

