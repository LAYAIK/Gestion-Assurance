import express from 'express';
import { getProfileController,updateProfileController } from '../controllers/ProfileUtlisateurController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

/**
 * @swagger
 * tags:
 *  name: Gestion Profiles
 *  description: Opérations liées au profil utilisateur
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/profile:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     description: Obtenir le profil de l'utilisateur connecté
 *     tags: [Gestion Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <votre_token_jwt>"
 *         description: Token JWT d'authentification au format Bearer
 *     responses:
 *       200:
 *         description: Profil utilisateur obtenu avec succès
 *       401:
 *         description: Non autorisé, token invalide ou expiré
 * 
 * /api/profile/:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     description: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Gestion Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <votre_token_jwt>"
 *         description: Token JWT d'authentification au format Bearer
 *     responses:
 *       200:
 *         description: Profil utilisateur mis à jour avec succès
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       401:
 *         description: Non autorisé, token invalide ou expiré
 */

const router = express.Router();

router.get('/api/profile', protect, getProfileController); // Protégée, pour l'utilisateur lui-même
router.put('/api/profile', protect, updateProfileController); // Protégée, pour l'utilisateur lui-même

router.get('/', (req, res) => {
    res.send('Bienvenue sur la plateforme de gestion d\'assurance ! Visitez /api-docs pour la documentation API.');
});

const ProfileRoute = router;
export default ProfileRoute;
