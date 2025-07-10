// src/routes/TypeAssuranceRoute.js
import express from 'express';
import { createTypeAssurance, getAllTypesAssurance, getTypeAssuranceById, updateTypeAssurance, deleteTypeAssurance } from '../controllers/TypeAssuranceController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js'; // Assurez-vous du chemin correct

/**
 * @swagger
 * tags:
 *   name: Gestion des Types d'Assurance
 *   description: Opérations de gestion des types d'assurance.
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
 * /api/typesAssurance/:
 *   post:
 *     summary: Créer un nouveau type d'assurance
 *     tags: [Gestion des Types d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TypeAssurance'
 *     responses:
 *       201:
 *         description: Type d'assurance crée avec successe
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * 
 * /api/typesAssurances:
 *   get:
 *     summary: Obtenir tous les types d'assurance
 *     tags: [Gestion des Types d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Types d'assurance trouvées
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * 
 * /api/typesAssurance/{id}:
 *   get:
 *     summary: Obtenir un type d'assurance par ID
 *     tags: [Gestion des Types d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du type d'assurance.
 *     responses:
 *       200:
 *         description: Type d'assurance trouvé
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Type d'assurance non trouvé.
 *       500:
 *         description: Erreur serveur.
 * 
 *
 * 
 *   put:
 *     summary: Modifier un type d'assurance par ID
 *     tags: [Gestion des Types d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du type d'assurance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TypeAssurance'
 *     responses:
 *       200:
 *         description: Type d'assurance modifié avec successe
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Type d'assurance non trouvée.
 *       500:
 *         description: Erreur serveur.
 * 
 * 
 *   delete:
 *     summary: Supprimer un type d'assurance par ID
 *     tags: [Gestion des Types d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du type d'assurance.
 *     responses:
 *       200:
 *         description: Type d'assurance supprimé avec successe
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Type d'assurance non trouvée.
 */

const router = express.Router();

// Routes pour la gestion des types d'assurance
// Seuls les admins peuvent créer, modifier ou supprimer
router.route('/api/typesAssurance/')
  .post(protect, authorize('admin'), createTypeAssurance) // Seuls les admins peuvent créer
  .get(protect, authorize('agent', 'admin'), getAllTypesAssurance); // Agents et Admins peuvent lister

router.route('/api/typesAssurance/:id')
  .get(protect, authorize('agent', 'admin'), getTypeAssuranceById) // Agents et Admins peuvent voir par ID
  .put(protect, authorize('admin'), updateTypeAssurance)
  .delete(protect, authorize('admin'), deleteTypeAssurance);

export default router;
