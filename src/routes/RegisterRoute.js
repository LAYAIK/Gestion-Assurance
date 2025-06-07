import RegisterUtilisateurController from "../controllers/RegisterUtilisateurController.js";
import express from "express";

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Enregistre un nouvel utilisateur dans la base de données
 *     tags: [Enregistrement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: John
 *               prenom:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: YWVvH@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               confirme_password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Utilisateur enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string 
 *                   example: Utilisateur enregistré avec succès !
 * 
 *       400:
 *         description: Erreur lors de l'enregistrement de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur lors de l'enregistrement de l'utilisateur 
 * 
 */



const router = express.Router(); // Création d'un routeur Express
// Route pour l'enregistrement d'un user

router.post("/register", RegisterUtilisateurController); // Route POST pour l'enregistrement, utilisant le contrôleur d'enregistrement des users
const RegisterRoute = router; // Exportation du routeur

export default RegisterRoute;