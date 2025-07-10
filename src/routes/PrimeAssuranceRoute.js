// src/routes/primeAssuranceRoutes.js
import { Router } from 'express';
import {
  genererAvisEcheance,
  marquerPrimePayee,
  getPrimesPourContrat
} from '../controllers/primeAssuranceController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js';
import { P } from 'pino';

/**
 * @swagger
 * tags:
 *   name: Gestion des Primes
 *   description: Opérations de gestion des primes.
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
 * /api/contrats/{id_contrat}/avis-echeance:
 *   post:
 *     summary: Envoi de l'avis de l'echeance
 *     description: Envoi de l'avis de l'echeance
 *     tags: [Gestion des Primes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contrat
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fichier:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avis de l'echeance envoyé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Contrat non trouvé.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/primes/{id_prime}/payee:
 *   put:
 *     summary: Marquer une prime comme payée
 *     description: Marquer une prime comme payée. Accessible uniquement par les gestionnaires et les administrateurs.
 *     tags: [Gestion des Primes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_prime
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la prime.
 *     responses:
 *       200:
 *         description: Prime marquée comme payée avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Prime non trouvée.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/contrats/{id_contrat}/primes:
 *   get:
 *     summary: Obtenir les primes liées au contrat
 *     description: Obtenir les primes liées au contrat. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Gestion des Primes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contrat
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contrat.
 *     responses:
 *       200:
 *         description: Primes obtenues avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prime'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 */

const router = Router();

router.post('/api/contrats/:id_contrat/avis-echeance', protect, authorize('gestionnaire', 'admin'), genererAvisEcheance);
router.put('/api/primes/:id_prime/payee', protect, authorize('gestionnaire', 'admin'), marquerPrimePayee);
router.get('/api/contrats/:id_contrat/primes', protect, getPrimesPourContrat);

const PrimeAssuranceRoute = router;
export default PrimeAssuranceRoute;