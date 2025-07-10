import { getRole, postRole, putRole } from "../controllers/RoleController.js";
import express from "express";

/**
 * @swagger
 * tags:
 *   name: Gestion des Roles
 *   description: Opérations liées au rôles utilisateur
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT 
 *       description: Authentification JWT .
 * 
 * /api/roles:
 *   get:
 *     summary: Obtenir la liste des rôles
 *     description: Obtenir la liste des rôles
 *     tags: [Gestion des Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: La liste des rôles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       500:
 *         description: Erreur lors de la recherche des rôles du client 
 * 
 * /api/roles/:
 *   post:
 *     summary: Créer un rôles
 *     description: Créer un rôles
 *     tags: [Gestion des Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: Le rôles a bien été créer
 *       400:
 *         description: Le rôles existe deja
 *       500:
 *         description: Erreur lors de la création du rôles du client 
 * 
 * /api/roles/{id}: 
 *   put:
 *     summary: Modifier un rôles
 *     description: Modifier un rôles
 *     tags: [Gestion des Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du rôles.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Le rôles a bien été modifié
 *       400:
 *         description: Le rôles existe deja
 *       500:
 *         description: Erreur lors de la modification du rôles du client
 */



const router = express.Router(); // Création d'un routeur Express
router.get("/api/roles", getRole); // Route publique pour la connexion, utilisant le contrôleur d'authentification
router.post("/api/roles/", postRole); // Route publique pour la connexion, utilisant le contrôleur d'authentification
router.put("/api/roles/:id", putRole); // Route publique pour la connexion, utilisant le contrôleur d'authentification


const RoleRoute = router; // Exportation du routeur
export default RoleRoute;