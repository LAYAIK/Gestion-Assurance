// src/routes/archiveRoutes.js
import { Router } from 'express';
import {
  archiver,
  getArchives,
  getArchiveById
} from '../controllers/ArchiveController.js';

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
 *   name: Archivage des dossiers
 *   description: Opérations liées au archivage des dossiers
 */

/**
 * @swagger
 * /api/dossiers/{id}:
 *   post:
 *     summary: Archiver un dossier
 *     description: Archiver un dossier existant.
 *     tags: [Archivage des dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du dossier à archiver.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               raison_archivage:
 *                 type: string
 *                 description: Raison de l'archivage.
 *     responses:
 *       200:
 *         description: Dossier archivé avec succès.
 *       401:
 *         description: Utilisateur non autorisé.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Dossier non trouvé.
 * 
 * /api/archives:
 *   get:
 *     summary: Obtenir la liste des archives
 *     description: Obtenir la liste des archives. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Archivage des dossiers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archives obtenues avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Archive'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 * 
 * /api/archives/{id_archive}:
 *   get:
 *     summary: Obtenir une archive par son ID
 *     description: Obtenir une archive par son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Archivage des dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_archive
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'archive.
 *     responses:
 *       200:
 *         description: Archive obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Archive'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 */

const router = Router();

router.post('/api/dossiers/:id', archiver);
router.get('/api/archives', getArchives);
router.get('/api/archives/:id_archive', getArchiveById);

const ArchiveRoute = router;
export default ArchiveRoute;