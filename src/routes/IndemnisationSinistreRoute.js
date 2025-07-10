// src/routes/indemnisationSinistreRoutes.js
import { Router } from 'express';
import {
  proposerIndemnisation,
  validerIndemnisation,
  enregistrerPaiementIndemnisation,
  getIndemnisations,
  getIndemnisationById
} from '../controllers/IndemnisationSinistreController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Gestion des Indemnisations
 *   description: Opérations de gestion des indemnisations.
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/sinistres/{id_sinistre}/indemnisation:
 *   post:
 *     summary: Proposer une indemnisation pour un sinistre
 *     description: Proposer une indemnisation pour un sinistre
 *     tags: [Gestion des Indemnisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_sinistre
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du sinistre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Indemnisation'
 *     responses:
 *       201:
 *         description: Indemnisation proposée avec successe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Indemnisation'
 *       400:
 *         description: Requête invalide (données manquantes, numéro de dossier deja utilisé, contrat/état non trouvés).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/indemnisations:
 *   get:
 *     summary: Obtenir toutes les indemnisations
 *     description: Obtenir toutes les indemnisations. Accessible uniquement par les agents et les gestionnaires.
 *     tags: [Gestion des Indemnisations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Indemnisations obtenues avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Indemnisation'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/indemnisations/{id_indemnisation}:
 *   get:
 *     summary: Obtenir une indemnisation par son ID
 *     description: Obtenir une indemnisation par son ID. Accessible uniquement par les agents et les gestionnaires.
 *     tags: [Gestion des Indemnisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_indemnisation
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'indemnisation.
 *     responses:
 *       200:
 *         description: Indemnisation obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Indemnisation'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Indemnisation non trouvée.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/indemnisations/{id_indemnisation}/valider:
 *   put:
 *     summary: Valider une indemnisation
 *     description: Valider une indemnisation. Accessible uniquement par les gestionnaires et les administrateurs.
 *     tags: [Gestion des Indemnisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_indemnisation
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'indemnisation.
 *     responses:
 *       200:
 *         description: Indemnisation validée avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Indemnisation non trouvée.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/indemnisations/{id_indemnisation}/enregistrer-paiement:
 *   put:
 *     summary: Enregistrer le paiement d'une indemnisation
 *     description: Enregistrer le paiement d'une indemnisation. Accessible uniquement par les gestionnaires et les administrateurs.
 *     tags: [Gestion des Indemnisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_indemnisation
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'indemnisation.
 *     responses:
 *       200:
 *         description: Paiement enregistré avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Indemnisation non trouvée.
 *       500:
 *         description: Erreur serveur.
 */

const router = Router();

// Routes pour proposer et gérer les indemnisations
router.post('/api/sinistres/:id_sinistre/indemnisation', protect, authorize('agent', 'gestionnaire', 'admin'), proposerIndemnisation);
router.put('/api/indemnisations/:id_indemnisation/valider', protect, authorize('gestionnaire', 'admin'), validerIndemnisation);
router.put('/api/indemnisations/:id_indemnisation/enregistrer-paiement', protect, authorize('gestionnaire', 'admin'), enregistrerPaiementIndemnisation);

// Routes de consultation
router.get('/api/indemnisations', protect, authorize('agent', 'gestionnaire', 'admin'), getIndemnisations);
router.get('/api/indemnisations/:id_indemnisation', protect, authorize('agent', 'gestionnaire', 'admin'), getIndemnisationById);

const IndemnisationSinistreRoute = router;
export default IndemnisationSinistreRoute ;