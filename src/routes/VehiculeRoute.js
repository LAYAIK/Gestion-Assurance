// src/routes/vehiculeRoutes.js
import express from 'express';
import {  createVehicule,  getAllVehicules,  getVehiculeById,  updateVehicule,  deleteVehicule } from '../controllers/VehiculeController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js'; // Assurez-vous que le chemin est correct

/**
 * @swagger
 * tags:
 *  name: Gestion des Véhicules
 *  description: Opérations d'enregistrement et de gestion des véhicules liés aux polices d'assurance.
 */

/**
 * @swagger
 * /api/vehicules:
 *   post:
 *     summary: Enregistrer un nouveau véhicule
 *     description: Enregistre un nouveau véhicule et l'associe à une police d'assurance existante.
 *     tags: [Gestion des Véhicules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - immatriculation
 *               - marque
 *               - modele
 *             properties:
 *               immatriculation:
 *                 type: string
 *                 description: Numéro d'immatriculation unique du véhicule.
 *                 example: "AB-123-CD"
 *               marque:
 *                 type: string
 *                 description: Marque du véhicule.
 *                 example: "Renault"
 *               modele:
 *                 type: string
 *                 description: Modèle du véhicule.
 *                 example: "Clio"
 *               annee_fabrication:
 *                 type: integer
 *                 description: Année de fabrication du véhicule.
 *                 example: 2020
 *               numero_chassis:
 *                 type: string
 *                 nullable: true
 *                 description: Numéro de châssis (VIN) du véhicule.
 *                 example: "VF1BB0N0A123456789"
 *               couleur:
 *                 type: string
 *                 nullable: true
 *                 description: Couleur du véhicule.
 *                 example: "Bleu"
 *     responses:
 *       201:
 *         description: Véhicule enregistré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicule'
 *       400:
 *         description: Requête invalide (données manquantes, immatriculation/châssis déjà utilisé, police non trouvée).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 *   get:
 *     summary: Obtenir tous les véhicules
 *     description: Récupère la liste de tous les véhicules enregistrés, avec option de filtrage par ID de police.
 *     tags: [Gestion des Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_police
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID (UUID) optionnel de la police pour filtrer les véhicules par contrat d'assurance.
 *     responses:
 *       200:
 *         description: Liste des véhicules obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicule'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/vehicules/{immatriculation}:
 *   get:
 *     summary: Obtenir un véhicule par immatriculation
 *     description: Récupère les détails d'un véhicule spécifique par son numéro d'immatriculation.
 *     tags: [Gestion des Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: immatriculation
 *         in: path
 *         description: Numéro d'immatriculation du véhicule.
 *         required: true
 *         schema:
 *           type: string
 *           example: "AB-123-CD"
 *     responses:
 *       200:
 *         description: Véhicule obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicule'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Véhicule non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   put:
 *     summary: Mettre à jour un véhicule
 *     description: Met à jour les informations d'un véhicule existant par son immatriculation.
 *     tags: [Gestion des Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: immatriculation
 *         in: path
 *         description: Numéro d'immatriculation du véhicule à mettre à jour.
 *         required: true
 *         schema:
 *           type: string
 *           example: "AB-123-CD"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marque:
 *                 type: string
 *                 description: Nouvelle marque du véhicule.
 *                 example: "Peugeot"
 *               modele:
 *                 type: string
 *                 description: Nouveau modèle du véhicule.
 *                 example: "208"
 *               annee_fabrication:
 *                 type: integer
 *                 description: Nouvelle année de fabrication.
 *                 example: 2022
 *               numero_chassis:
 *                 type: string
 *                 nullable: true
 *                 description: Nouveau numéro de châssis.
 *                 example: "VF1BB0N0A123456789X"
 *               couleur:
 *                 type: string
 *                 nullable: true
 *                 description: Nouvelle couleur du véhicule.
 *                 example: "Noir"
 *               id_police:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID de la police d'assurance associée (peut être mis à jour).
 *                 example: "f1e2d3c4-b5a6-7890-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Véhicule mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicule'
 *       400:
 *         description: Requête invalide (immatriculation/châssis déjà utilisé, police non trouvée).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Véhicule non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   delete:
 *     summary: Supprimer un véhicule
 *     description: Supprime un véhicule spécifique par son numéro d'immatriculation. (Généralement réservé aux admins).
 *     tags: [Gestion des Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: immatriculation
 *         in: path
 *         description: Numéro d'immatriculation du véhicule à supprimer.
 *         required: true
 *         schema:
 *           type: string
 *           example: "AB-123-CD"
 *     responses:
 *       200:
 *         description: Véhicule supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Véhicule non trouvé.
 *       500:
 *         description: Erreur serveur.
 */


const router = express.Router();

// Routes principales pour la gestion des véhicules
// Création (POST), Liste (GET)
router.route('/api/vehicules')
  .post(protect, authorize('agent', 'admin'), createVehicule) // Seuls agents/admins peuvent créer
  .get(protect, authorize('agent', 'admin'), getAllVehicules); // Agents/admins peuvent lister tous les véhicules

// Opérations sur un véhicule spécifique par immatriculation
router.route('/api/vehicules/:immatriculation')
  .get(protect, authorize('agent', 'admin', 'client'), getVehiculeById) // Un client peut voir son propre véhicule
  .put(protect, authorize('agent', 'admin'), updateVehicule)
  .delete(protect, authorize('admin'), deleteVehicule); // Suppression par admin uniquement

const VehiculeRoute = router;
export default VehiculeRoute;
