// src/controllers/archiveDossierController.js
import ArchiveService from '../services/ArchiveService.js';
import Dossier from '../models/DossierModel.js';
import { getDossierById } from './DossierController.js'; // Assurez-vous que le chemin est <correct>  </correct>DossierController.js';  

export const archiver = async (req, res) => {
  const { id_dossier } = req.params;
  const { raison_archivage } = req.body;
  try {

    const dossier = await Dossier.getDossierById(id_dossier);
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }

    const archive = await ArchiveService.archiver(id_dossier, raison_archivage);
    res.status(201).json(archive);
    // const archive = await ArchiveService.archiver(id_dossier, raison_archivage);
    // res.status(201).json(archive);
  } catch (error) {
    console.error('Erreur lors de l\'archivage du dossier:', error);
    res.status(error.message === 'Dossier non trouvé' ? 404 : 500).json({ message: error.message });
  }
};

export const getArchives = async (req, res) => {
  try {
    const archives = await ArchiveService.getArchives();
    res.status(200).json(archives);
  } catch (error) {
    console.error('Erreur lors de la récupération des archives:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des archives', error: error.message });
  }
};

export const getArchiveById = async (req, res) => {
  const { id_archive } = req.params;
  try {
    const archive = await ArchiveService.getArchiveById(id_archive);
    res.status(200).json(archive);
  } catch (error) {
     console.error('Erreur lors de la récupération de l\'archive:', error);
    res.status(error.message === 'Archive non trouvée' ? 404 : 500).json({ message: error.message });
  }
};