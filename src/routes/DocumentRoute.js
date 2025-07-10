// src/routes/documentRoutes.js
import { Router } from 'express';
import {
  uploaderDocument,
  getDocumentsByEntity,
  getDocumentById,
  supprimerDocument,
} from '../controllers/DocumentController.js';


/**
 * @swagger
 * tags:
 *   name: Gestion des Documents
 *   description: Opérations de gestion des documents.
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
 * /api/documents:
 *   post:
 *     summary: Enregistrer un document
 *     description: Enregistrer un nouveau document.
 *     tags: [Gestion des Documents]
 *     security:
 *       - bearerAuth: []
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
 *         description: Document enregistré avec succès.
 *       401:
 *         description: Non autorisé.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 * 
 * /api/{entite_liee}/{id_entite_liee}/documents:
 *   get:
 *     summary: Obtenir tous les documents d'une entité
 *     description: Obtenir la liste de tous les documents d'une entité.
 *     tags: [Gestion des Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entite_liee
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de l'entité.
 *       - in: path
 *         name: id_entite_liee
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entité.
 *     responses:
 *       200:
 *         description: Liste des documents obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 * 
 * /api/documents/{id_document}:
 *   get:
 *     summary: Obtenir un document par son ID
 *     description: Obtenir un document par son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Gestion des Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_document
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du document.
 *     responses:
 *       200:
 *         description: Document obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).  
 * 
 *   delete:
 *     summary: Supprimer un document par son ID
 *     description: Supprimer un document par son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Gestion des Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_document
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du document.
 *     responses:
 *       200:
 *         description: Document supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 */

const router = Router();

// `upload.single('fichier')` doit correspondre au nom du champ dans le formulaire
router.post('/api/documents', uploaderDocument); // Pas de protect/authorizeRoles ici si vous voulez que n'importe qui puisse uploader
router.get('/api/:entite_liee/:id_entite_liee/documents', getDocumentsByEntity);
router.get('/api/documents/:id_document', getDocumentById);
router.delete('/api/documents/:id_document', supprimerDocument); // Ajouter protect/authorizeRoles si nécessaire

const DocumentRoute = router;
export default DocumentRoute;