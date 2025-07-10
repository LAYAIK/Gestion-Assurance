// src/routes/sinistreRoutes.js
import express from 'express';
import {  createSinistre,  getAllSinistres,  getSinistreById,  updateSinistre,  deleteSinistre} from '../controllers/SinistreController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js'; // Assurez-vous que le chemin est correct

const router = express.Router();

// Routes principales pour la gestion des sinistres
// La déclaration (POST) peut être faite par les clients, agents ou admins.
// La consultation de tous les sinistres (GET) est pour les agents et admins.
router.route('/api/sinistres/')
  .post(protect, authorize('client', 'agent', 'admin'), createSinistre)
  .get(protect, authorize('agent', 'admin'), getAllSinistres);

// Opérations sur un sinistre spécifique par ID
// La consultation par ID (GET) est pour les clients (pour leurs propres sinistres), agents et admins.
// La mise à jour (PUT) est pour les agents et admins.
// La suppression (DELETE) est généralement réservée aux admins.
router.route('/api/sinistres/:id')
  .get(protect, authorize('client', 'agent', 'admin'), getSinistreById)
  .put(protect, authorize('agent', 'admin'), updateSinistre)
  .delete(protect, authorize('admin'), deleteSinistre);

const SinistreRoute = router;
export default SinistreRoute;
