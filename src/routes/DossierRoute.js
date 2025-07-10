// src/routes/dossierRoutes.js
import express from 'express';
import { createDossier,  getAllDossiers,  getDossierById,  updateDossier,  deleteDossier,  getDossierSinistres,  getDossierHistory } from '../controllers/DossierController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js'; // Assurez-vous que le chemin est correct


const router = express.Router();

// Routes principales pour la gestion des dossiers
router.route('/api/dossiers/')
  .post(protect, authorize('agent', 'admin'), createDossier) // Création par agents/admins
  .get(protect, authorize('agent', 'admin'), getAllDossiers); // Liste par agents/admins

// Opérations sur un dossier spécifique par ID
router.route('/api/dossiers/:id')
  .get(protect, authorize('agent', 'admin'), getDossierById) // Consultation par agents/admins
  .put(protect, authorize('agent', 'admin'), updateDossier) // Mise à jour par agents/admins
  .delete(protect, authorize('admin'), deleteDossier); // Suppression par admin uniquement

// Routes pour les informations liées aux dossiers
router.route('/api/dossiers/:id/sinistres')
  .get(protect, authorize('agent', 'admin'), getDossierSinistres); // Obtenir les sinistres liés

router.route('/api/dossiers/:id/history')
  .get(protect, authorize('agent', 'admin'), getDossierHistory); // Obtenir l'historique lié

  const DossierRoute = router;
  export default DossierRoute;