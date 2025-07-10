// src/controllers/SinistreController.js
import Sinistre from '../models/SinistreModel.js';
import Dossier from '../models/DossierModel.js';
import ContratAssurance from '../models/ContratAssuranceModel.js';
import Utilisateur from '../models/UtilisateurModel.js';
import HistoriqueEvent from '../models/HistoriqueEventModel.js'; // Pour enregistrer les événements
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
import { getUserIdFromContext } from '../middlewares/AuditMiddleware.js';

/**
 * @swagger
 * tags:
 *  name: Gestion des Sinistres
 *  description: Déclaration, suivi des étapes, enregistrement des dates clés et des montants, assignation des sinistres.
 */

/**
 * @swagger
 * /api/sinistres:
 *   post:
 *     summary: Déclarer un nouveau sinistre
 *     description: Permet aux clients ou agents de déclarer un nouveau sinistre.
 *     tags: [Gestion des Sinistres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_sinistre
 *               - date_incident
 *               - description
 *               - id_dossier
 *               - id_police
 *             properties:
 *               numero_sinistre:
 *                 type: string
 *                 description: Numéro unique du sinistre.
 *                 example: "SIN-2024-001"
 *               date_incident:
 *                 type: string
 *                 format: date
 *                 description: Date à laquelle l'incident s'est produit (AAAA-MM-JJ).
 *                 example: "2024-07-05"
 *               description:
 *                 type: string
 *                 description: Description détaillée du sinistre.
 *                 example: "Collision frontale sur l'autoroute A1."
 *               type_sinistre:
 *                 type: string
 *                 nullable: true
 *                 description: Type du sinistre (par exemple "Collision", "Incendie", "Accident", etc).
 *                 example: "Collision"
 *               statut:
 *                 type: string
 *                 enum: [Déclaré, En expertise, Approuvé, Refusé, Clos]
 *                 description: Statut initial du sinistre (par défaut 'Déclaré').
 *                 example: "Déclaré"
 *               montant_estime:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Montant estimé du dommage.
 *                 example: 5000.00
 *               id_dossier:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) du dossier associé.
 *                 example: "g1h2i3j4-k5l6-7890-1234-567890abcdef"
 *               id_police:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) du contrat d'assurance lié.
 *                 example: "d1e2f3a4-b5c6-7890-1234-567890abcdef"
 *               id_utilisateur_gestionnaire:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID (UUID) de l'utilisateur (expert/agent) assigné à ce sinistre.
 *                 example: "c1d2e3f4-a5b6-7890-1234-567890abcdef"
 *     responses:
 *       201:
 *         description: Sinistre déclaré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sinistre'
 *       400:
 *         description: Requête invalide (données manquantes, numéro de sinistre déjà utilisé, dossier/contrat non trouvés).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 *   get:
 *     summary: Obtenir tous les sinistres
 *     description: Récupère la liste de tous les sinistres enregistrés, avec options de filtrage.
 *     tags: [Gestion des Sinistres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_dossier
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID (UUID) optionnel du dossier pour filtrer les sinistres.
 *       - name: id_police
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID (UUID) optionnel de la police pour filtrer les sinistres.
 *       - name: statut
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Déclaré, En expertise, Approuvé, Refusé, Clos]
 *         description: Statut optionnel du sinistre pour filtrer.
 *     responses:
 *       200:
 *         description: Liste des sinistres obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sinistre'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */
export const createSinistre = async (req, res) => {
  const {
    numero_sinistre,
    date_incident,
    description,
    type_sinistre,
    statut,
    montant_estime,
    id_dossier,
    id_police,
    id_utilisateur_gestionnaire
  } = req.body;

  if (!numero_sinistre || !date_incident || !description  || !id_police) {
    return res.status(400).json({ message: 'Le numéro, la date de l\'incident, la description, le dossier et la police sont obligatoires.' });
  }

  try {
    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const sinistreExists = await Sinistre.findOne({ where: { numero_sinistre } }, { transaction: t });
    if (sinistreExists) {
      return res.status(400).json({ message: 'Un sinistre avec ce numéro existe déjà.' });
    }

    // Vérifier l'existence des entités liées
    const dossier = await Dossier.findByPk(id_dossier);
    if (!dossier) return res.status(400).json({ message: 'Dossier non trouvé.' });

    const contrat = await ContratAssurance.findByPk(id_police);
    if (!contrat) return res.status(400).json({ message: 'Contrat d\'assurance non trouvé.' });

    if (id_utilisateur_gestionnaire) {
        const utilisateur = await Utilisateur.findByPk(id_utilisateur_gestionnaire);
        if (!utilisateur) return res.status(400).json({ message: 'Utilisateur gestionnaire non trouvé.' });
    }

    const newSinistre = await Sinistre.create({
      numero_sinistre,
      date_incident,
      description,
      type_sinistre: type_sinistre || null,
      statut: statut || 'Déclaré',
      montant_estime: montant_estime || null,
      id_dossier,
      id_police,
      id_utilisateur_gestionnaire
    }, { transaction: t , userId: userId });

    await t.commit();
    res.status(201).json({ message: 'Sinistre déclaré avec succès.', sinistre: newSinistre });

  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la déclaration du sinistre:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Le numéro de sinistre est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation des données.', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la déclaration du sinistre.' });
  }
};

export const getAllSinistres = async (req, res) => {
  const { id_dossier, id_police, statut } = req.query;
  let whereClause = {};

  if (id_dossier) whereClause.id_dossier = id_dossier;
  if (id_police) whereClause.id_police = id_police;
  if (statut) whereClause.statut = statut;

  try {
    const sinistres = await Sinistre.findAll({
      where: whereClause,
      order: [['date_declaration', 'DESC']],
      include: [
        { model: Dossier, as: 'dossier_parent', attributes: ['id_dossier', 'numero_dossier', 'titre'] },
        { model: ContratAssurance, as: 'contrat_sinistre', attributes: ['id_police', 'numero_contrat'] },
        { model: Utilisateur, as: 'gestionnaire_sinistre', attributes: ['id', 'nom', 'email'] }
      ]
    });
    res.status(200).json(sinistres);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les sinistres:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des sinistres.' });
  }
};

/**
 * @swagger
 * /api/sinistres/{id}:
 *   get:
 *     summary: Obtenir un sinistre par ID
 *     description: Récupère les détails d'un sinistre spécifique par son ID (id_sinistre).
 *     tags: [Gestion des Sinistres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du sinistre.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sinistre obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sinistre'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Sinistre non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   put:
 *     summary: Mettre à jour un sinistre
 *     description: Met à jour les informations d'un sinistre existant par son ID.
 *     tags: [Gestion des Sinistres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du sinistre à mettre à jour.
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
 *               numero_sinistre:
 *                 type: string
 *                 description: Nouveau numéro unique du sinistre.
 *                 example: "SIN-2024-001-MOD"
 *               date_incident:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-06"
 *               description:
 *                 type: string
 *                 example: "Collision mise à jour : constat amiable reçu."
 *               type_sinistre:
 *                 type: string
 *                 example: "Vol"
 *               statut:
 *                 type: string
 *                 enum: [Déclaré, En expertise, Approuvé, Refusé, Clos]
 *                 example: "En expertise"
 *               montant_estime:
 *                 type: number
 *                 format: float
 *                 example: 6000.00
 *               montant_regle:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Montant réglé pour le sinistre.
 *                 example: 5500.00
 *               date_resolution:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date de résolution du sinistre (AAAA-MM-JJ).
 *                 example: "2024-08-30"
 *               id_dossier:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID du dossier associé.
 *                 example: "g1h2i3j4-k5l6-7890-1234-567890abcdeg"
 *               id_police:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID du contrat d'assurance lié.
 *                 example: "d1e2f3a4-b5c6-7890-1234-567890abcdeh"
 *               id_utilisateur_gestionnaire:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Nouveau ID de l'utilisateur (expert/agent) assigné à ce sinistre.
 *                 example: "c1d2e3f4-a5b6-7890-1234-567890abcejk"
 *     responses:
 *       200:
 *         description: Sinistre mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sinistre'
 *       400:
 *         description: Requête invalide (numéro de sinistre déjà utilisé, dossier/contrat/utilisateur non trouvés).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Sinistre non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   delete:
 *     summary: Supprimer un sinistre
 *     description: Supprime un sinistre spécifique par son ID. (Généralement réservé aux admins).
 *     tags: [Gestion des Sinistres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du sinistre à supprimer.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sinistre supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Sinistre non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const getSinistreById = async (req, res) => {
  try {
    const sinistre = await Sinistre.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier_parent', attributes: ['id_dossier', 'numero_dossier', 'titre'] },
        { model: ContratAssurance, as: 'contrat_sinistre', attributes: ['id_police', 'numero_contrat'] },
        { model: Utilisateur, as: 'gestionnaire_sinistre', attributes: ['id', 'nom', 'email'] }
      ]
    });

    if (!sinistre) {
      return res.status(404).json({ message: 'Sinistre non trouvé.' });
    }
    res.status(200).json(sinistre);
  } catch (error) {
    console.error('Erreur lors de la récupération du sinistre par ID:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du sinistre.' });
  }
};

export const updateSinistre = async (req, res) => {
  const {
    numero_sinistre,
    date_incident,
    description,
    type_sinistre,
    statut,
    montant_estime,
    montant_regle,
    date_resolution,
    id_dossier,
    id_police,
    id_utilisateur_gestionnaire
  } = req.body;
  const { id } = req.params;

  try {

    const usrId = getUserIdFromContext();
    const t  = await sequelize.transaction(); 

    const sinistre = await Sinistre.findByPk(id, { transaction: t });

    if (!sinistre) {
      return res.status(404).json({ message: 'Sinistre non trouvé.' });
    }

    // Vérifier si le nouveau numéro de sinistre est déjà pris par un autre sinistre
    if (numero_sinistre && numero_sinistre !== sinistre.numero_sinistre) {
      const existingSinistre = await Sinistre.findOne({ where: { numero_sinistre } });
      if (existingSinistre) {
        return res.status(400).json({ message: 'Le nouveau numéro de sinistre est déjà utilisé.' });
      }
      sinistre.numero_sinistre = numero_sinistre;
    }

    // Vérifier l'existence des entités liées si leurs IDs sont fournis et différents
    if (id_dossier && id_dossier !== sinistre.id_dossier) {
        const dossier = await Dossier.findByPk(id_dossier);
        if (!dossier) return res.status(400).json({ message: 'Nouveau dossier non trouvé.' });
        sinistre.id_dossier = id_dossier;
    }
    if (id_police && id_police !== sinistre.id_police) {
        const contrat = await ContratAssurance.findByPk(id_police);
        if (!contrat) return res.status(400).json({ message: 'Nouveau contrat d\'assurance non trouvé.' });
        sinistre.id_police = id_police;
    }
    if (id_utilisateur_gestionnaire !== undefined && id_utilisateur_gestionnaire !== sinistre.id_utilisateur_gestionnaire) {
        if (id_utilisateur_gestionnaire) {
            const utilisateur = await Utilisateur.findByPk(id_utilisateur_gestionnaire);
            if (!utilisateur) return res.status(400).json({ message: 'Nouvel utilisateur gestionnaire non trouvé.' });
        }
        sinistre.id_utilisateur_gestionnaire = id_utilisateur_gestionnaire;
    }

    // Mettre à jour les autres champs
    if (date_incident) sinistre.date_incident = date_incident;
    if (description) sinistre.description = description;
    if (type_sinistre !== undefined) sinistre.type_sinistre = type_sinistre;
    if (statut) {
        sinistre.statut = statut;
        // Si le statut passe à 'Clos', enregistrer la date de résolution si non déjà fournie
        if (statut === 'Clos' && !date_resolution) {
            sinistre.date_resolution = new Date().toISOString().slice(0, 10); // Date du jour
        }
    }
    if (montant_estime !== undefined) sinistre.montant_estime = montant_estime;
    if (montant_regle !== undefined) sinistre.montant_regle = montant_regle;
    if (date_resolution !== undefined) sinistre.date_resolution = date_resolution; // Permet de mettre à null

    await sinistre.save( { transaction: t, userId: usrId } );

    await t.commit();


    res.status(200).json({ message: 'Sinistre mis à jour avec succès.', sinistre });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du sinistre:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({ message: `Le champ '${field}' est déjà utilisé.` });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du sinistre.' });
  }
};

export const deleteSinistre = async (req, res) => {
  try {

    const t = await sequelize.transaction();
    const usrId = getUserIdFromContext();
    const sinistre = await Sinistre.findByPk(req.params.id, { transaction: t });

    if (!sinistre) {
      return res.status(404).json({ message: 'Sinistre non trouvé.' });
    }

    // TODO: Implémenter ici une logique de vérification ou de suppression en cascade
    // Par exemple, délier les événements d'historique liés au sinistre.
    // Ou configurer onDelete dans les associations (ex: onDelete: 'SET NULL' ou 'CASCADE').

    await sinistre.destroy({ transaction: t, userId: usrId });

    await t.commit();

    res.status(200).json({ message: 'Sinistre supprimé avec succès.' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la suppression du sinistre:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du sinistre.' });
  }
};
