// src/routes/ClientRoute.js
import express from 'express';
import { createClient, getAllClients, getClientById, updateClient, deleteClient, getClientHistory, getClientDocuments } from '../controllers/ClientController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js';


/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestion des clients (par l'agent ou l'admin) et de leur historique et de leurs documents (par l'agent ou l'admin)
 *
 * /api/clients:
 *   post:
 *     summary: Créer un nouveau client
 *     description: Créer un nouveau client. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
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
 *               telephone:
 *                 type: string
 *                 example: "1234567890"
 *               adresse:
 *                 type: string
 *                 example: 123 Main Street
 *               telephone1:
 *                 type: string
 *                 example: "1234567890"
 *               numero_identite:
 *                 type: string
 *                 example: "1234567890"
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - telephone
 *               - adresse
 *               - numero_identite
 *     responses:
 *       201:
 *         description: Client créé avec succes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Requête invalide.
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *
 *   get:
 *     summary: Obtenir tous les clients
 *     description: Obtenir tous les clients. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clients obtenus avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *
 * /api/clients/{id_client}:
 *   get:
 *     summary: Obtenir un client par ID ou par email
 *     description: Obtenir les détails d'un client spécifique par son ID ou son email. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_client
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du client.
 *     responses:
 *       200:
 *         description: Client obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Client non trouvé.
 *
 *   put:
 *     summary: Mettre à jour un client
 *     description: Mettre à jour les données d'un client existant par son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_client
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du client à mettre à jour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Jean
 *               prenom:
 *                 type: string
 *                 example: Valjean
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.valjean@example.com
 *               telephone:
 *                 type: string
 *                 example: "0987654321"
 *               adresse:
 *                 type: string
 *                 example: "456 Main Avenue"
 *               telephone1:
 *                 type: string
 *                 example: "0987654322"
 *               numero_identite:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       200:
 *         description: Client mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Données invalides ou email deja utilisé.
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Client non trouvé.
 *
 *   delete:
 *     summary: Supprimer un client (par Admin)
 *     description: Supprimer un client spécifique par son ID. Accessible uniquement par les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_client
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du client à supprimer.
 *     responses:
 *       200:
 *         description: Client supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Client non trouvé.
 *
 * /api/clients/{id_client}/history:
 *   get:
 *     summary: Obtenir l'historique d'un client
 *     description: Obtenir l'historique d'un client par son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_client
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du client.
 *     responses:
 *       200:
 *         description: Historique obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Historique'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Client non trouvé.
 *
 * /api/clients/{id_client}/documents:
 *   get:
 *     summary: Obtenir les documents d'un client
 *     description: Obtenir les documents d'un client par son ID. Accessible uniquement par les agents et les administrateurs.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_client
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du client.
 *     responses:
 *       200:
 *         description: Documents obtenus avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       401:
 *         description: Non autorisé, token invalide ou expiré.
 *       403:
 *         description: Accès refusé, rôle insuffisant (non-administrateur).
 *       404:
 *         description: Client non trouvé.
 */
const router = express.Router();

// Routes pour la gestion des clients (CRUD)
// Ces routes nécessitent d'être authentifié et d'avoir le rôle 'agent' ou 'admin'
router.route('/')
  .post(protect, authorize('agent', 'admin'), createClient)
  .get(protect, authorize('agent', 'admin'), getAllClients);

router.route('/:id_client')
  .get(protect, authorize('agent', 'admin'), getClientById)
  .put(protect, authorize('agent', 'admin'), updateClient)
  .delete(protect, authorize('admin'), deleteClient); // Généralement, seule l'admin peut supprimer

// Routes pour l'historique et les documents d'un client
router.route('/:id_client/history')
  .get(protect, authorize('agent', 'admin'), getClientHistory);

router.route('/:id_client/documents')
  .get(protect, authorize('agent', 'admin'), getClientDocuments);

export default router; // Exportation du routeur pour l'utiliser dans l'application principale
