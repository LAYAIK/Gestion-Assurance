import { LoginController , logout } from "../controllers/AuthController.js";
import express from "express";

/**
 * @swagger
 * /Auth/login:
 *   post:
 *     summary: Authentification de l'utilisateur
 *     description: Authentifie l'utilisateur en utilisant son email et son mot de passe et renvoie un token JWT
 *     tags: [Authentification]
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
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Utilisateur authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       401:
 *         description: Utilisateur non authentifié ou token invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur non authentifié ou token invalide
 * 
 */




const router = express.Router(); // Création d'un routeur Express
// Route pour l'authentification
router.post('/login', LoginController); // Route publique pour la connexion, utilisant le contrôleur d'authentification
router.post('/logout', logout); // Nouvelle route de déconnexion


const loginLogoutRoute = router; // Exportation du routeur
export default loginLogoutRoute; 



