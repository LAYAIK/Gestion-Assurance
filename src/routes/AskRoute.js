import askController from "../controllers/AskController.js";
import express from "express";

/**
 * @swagger
 * /ask:
 *   post:
 *     summary: Demande de compte utilisateur
 *     description: Demande de compte utilisateur
 *     tags: [Demande d'acces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: YWVvH@example.com
 *               fonction:
 *                 type: string
 *                 example: Fonction
 *               direction:
 *                 type: string
 *                 example: Direction
 *               justificatif:
 *                 type: string
 *                 example: Justificatif
 *     responses:
 *       200:
 *         description: Demande envoyéee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Demande envoyéee
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_utilisateur:
 *                       type: string
 *                       format: uuid
 *                     nom:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     is_actif:
 *                       type: boolean
 *                     id_role:
 *                       type: string
 *                       format: uuid
 */


const router = express.Router(); // Création d'un routeur Express
// Route pour l'authentification
router.post("/ask", askController); // Route publique pour la connexion, utilisant le contrôleur d'authentification


const askRoute = router; // Exportation du routeur
export default askRoute;