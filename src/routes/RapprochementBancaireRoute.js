import { Router } from "express";
import {
    importerTransactions,
    rapprocherTransactions
} from "../controllers/RapprochementBancaireController.js";
import { protect, authorize } from "../middlewares/AuthMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Gestion des Transactions
 *   description: Opérations de gestion des transactions.
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
 * /api/transactions/importer:
 *   post:
 *     summary: Importer des transactions
 *     description: Importer des transactions depuis un fichier CSV
 *     tags: [Gestion des Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Transactions importées avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/transactions/rapprocher:
 *   put:
 *     summary: Rapprocher des transactions
 *     description: Rapprocher des transactions
 *     tags: [Gestion des Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions rapprochées avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */

const router = Router();

router.post('/api/transactions/importer', protect, authorize('gestionnaire', 'admin'), importerTransactions); //
router.put('/api/transactions/rapprocher', protect, authorize('gestionnaire', 'admin'), rapprocherTransactions);

const RapprochementBancaireRoute = router;
export default RapprochementBancaireRoute;