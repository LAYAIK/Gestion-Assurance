import express from 'express';
import { getUsers,getUserById,updateUser,deleteUser } from '../controllers/GestionUtilisateurController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtenir tous les utilisateurs
 *     description: Obtenir tous les utilisateurs. Accessible uniquement par les administrateurs.
 *     tags: [Gestion Utilisateur par l'Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateurs obtenus avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Utilisateur'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *
 * /api/users/{id}:
 *   get:
 *     summary: Obtenir un utilisateur par ID
 *     description: Obtenir les détails d'un utilisateur spécifique par son ID. Accessible uniquement par les administrateurs.
 *     tags: [Gestion Utilisateur par l'Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de l'utilisateur (UUID)
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Utilisateur obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Utilisateur non trouvé.
 *   patch:
 *     summary: Mettre à jour un utilisateur (par Admin)
 *     description: Mettre à jour les informations d'un utilisateur spécifique. Accessible uniquement par les administrateurs.
 *     tags: [Gestion Utilisateur par l'Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de l'utilisateur (UUID)
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_role:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID du rôle associé (si applicable)
 *             example:
 *               id_role: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *       400:
 *         description: Données invalides ou email déjà utilisé.
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Utilisateur non trouvé.
 *   delete:
 *     summary: Supprimer un utilisateur (par Admin)
 *     description: Supprimer un utilisateur spécifique par son ID. Accessible uniquement par les administrateurs.
 *     tags: [Gestion Utilisateur par l'Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID de l'utilisateur (UUID)
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Utilisateur non trouvé.
 */


const router = express.Router();

// Toutes ces routes sont protégées et réservées aux administrateurs
router.route('/api/users')
  .get(protect, authorize('admin'), getUsers); // Seuls les admins peuvent lister tous les utilisateurs

router.route('/api/users/:id')
  .get(protect, authorize('admin'), getUserById) // Seuls les admins peuvent voir un utilisateur par ID
  .patch(protect, authorize('admin'), updateUser)  // Seuls les admins peuvent modifier un utilisateur
  .delete(protect, authorize('admin'), deleteUser); // Seuls les admins peuvent supprimer un utilisateur
  

const GestionUtilisateurRoute = router; // Exportation du routeur
export default GestionUtilisateurRoute; // Exportation du routeur pour l'utiliser dans l'application principale
