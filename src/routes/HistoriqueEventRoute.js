// src/routes/historiqueEventRoutes.js
import { Router } from 'express';
import { getHistoriqueEvents, getHistoriqueForEntity } from '../controllers/HistoriqueEventController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js';


/**
 * @swagger
 * tags:
 *   name: Historique
 *   description: Gestion de l'historique des événements (par l'agent ou l'admin) 
 */

/**
 * @swagger
 * /api/historique:
 *   get:
 *     summary: Obtenir l'historique des événements
 *     description: Récupérer la liste de tous les événements enregistrés.
 *     tags: [Historique]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoriqueEvent'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/historique/{entite_type}/{entite_id}:
 *   get:
 *     summary: Obtenir l'historique d'une entité
 *     description: Obtenir l'historique d'une entité par son type et son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Historique]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entite_type
 *         required: true
 *         schema:
 *           type: string
 *         description: Type de l'entité.
 *       - in: path
 *         name: entite_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entité.
 *     responses:
 *       200:
 *         description: L'historique de l'entité obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoriqueEvent'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant. 
 */

const router = Router();

// Route pour l'historique global, avec filtres
router.get('/api/historique', protect, authorize('gestionnaire', 'admin'), getHistoriqueEvents);

// Route pour l'historique d'une entité spécifique
router.get('/api/historique/:entite_type/:entite_id', protect, authorize('gestionnaire', 'admin', 'agent'), getHistoriqueForEntity);

const HistoriqueEventRoute = router;
export default HistoriqueEventRoute;