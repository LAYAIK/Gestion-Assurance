// src/routes/contratAssRoutes.js
import express from 'express';
import {  createContratAssurance,  getAllContratsAssurance,  getContratAssuranceById,  updateContratAssurance,  deleteContratAssurance,  renewContratAssurance, cancelContratAssurance } from '../controllers/ContratAssuranceController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js'; // Assurez-vous que le chemin est correct

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
 * tags:
 *  name: Gestion des Contrats d'Assurance
 *  description: Opérations de gestion des polices d'assurance (contrats).
 */
/**
 * @swagger
 * /api/contrats:
 *   post:
 *     summary: Créer un nouveau contrat d'assurance
 *     description: Crée un nouveau contrat d'assurance en le liant à un client, un type d'assurance et une compagnie.
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_contrat
 *               - date_debut
 *               - date_fin
 *               - montant_prime
 *               - id_client
 *               - id_type_assurance
 *               - id_compagnie
 *             properties:
 *               numero_contrat:
 *                 type: string
 *                 description: Numéro unique du contrat.
 *                 example: "POLICE-2024-0001"
 *               date_debut:
 *                 type: string
 *                 format: date
 *                 description: Date de début du contrat (AAAA-MM-JJ).
 *                 example: "2024-01-01"
 *               date_fin:
 *                 type: string
 *                 format: date
 *                 description: Date de fin du contrat (AAAA-MM-JJ).
 *                 example: "2025-01-01"
 *               montant_prime:
 *                 type: number
 *                 format: float
 *                 description: Montant de la prime d'assurance.
 *                 example: 1250.75
 *               statut_contrat:
 *                 type: string
 *                 enum: [Actif, Expiré, Annulé, En attente, Renouvelé]
 *                 description: Statut initial du contrat (par défaut 'Actif').
 *                 example: "Actif"
 *               id_client:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) du client associé.
 *                 example: "e1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               id_type_assurance:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) du type d'assurance associé.
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               id_compagnie:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) de la compagnie d'assurance émettrice.
 *                 example: "b1c2d3e4-f5a6-7890-1234-567890abcdef"
 *               id_utilisateur_gestionnaire:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID (UUID) de l'utilisateur qui gère ce contrat.
 *                 example: "c1d2e3f4-a5b6-7890-1234-567890abcdef"
 *     responses:
 *       201:
 *         description: Contrat d'assurance créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratAssurance'
 *       400:
 *         description: Requête invalide (données manquantes, client/type/compagnie non trouvés, numéro de contrat déjà utilisé).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/contrats:
 *   get:
 *     summary: Obtenir tous les contrats d'assurance
 *     description: Récupère la liste de tous les contrats d'assurance enregistrés.
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des contrats obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContratAssurance'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */

const router = express.Router();

// Routes principales pour la gestion des contrats
// Création (POST), Liste (GET)
router.route('/api/contrats/')
  .post(protect, authorize('agent', 'admin'), createContratAssurance)
  .get(protect, authorize('agent', 'admin'), getAllContratsAssurance);

// Opérations sur un contrat spécifique par ID
router.route('/api/contrats/:id')
  .get(protect, authorize('agent', 'admin', 'client'), getContratAssuranceById) // Un client peut voir son propre contrat
  .put(protect, authorize('agent', 'admin'), updateContratAssurance)
  .delete(protect, authorize('admin'), deleteContratAssurance); // Suppression par admin uniquement

// Routes spécifiques pour le renouvellement et l'annulation
router.route('/api/contrats/:id/renouveler')
  .patch(protect, authorize('agent', 'admin'), renewContratAssurance); // PATCH pour une mise à jour partielle

router.route('/api/contrats/:id/annuler')
  .patch(protect, authorize('agent', 'admin'), cancelContratAssurance); // PATCH pour une mise à jour partielle

const ContratAssuranceRoute = router;
export default ContratAssuranceRoute;
