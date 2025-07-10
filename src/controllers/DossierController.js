// src/controllers/DossierController.js
import Dossier from '../models/DossierModel.js';
import ContratAssurance from '../models/ContratAssuranceModel.js';
import EtatDossier from '../models/EtatDossierModel.js';
import Sinistre from '../models/SinistreModel.js';
import HistoriqueEvent from '../models/HistoriqueEventModel.js';
import { Op } from 'sequelize';
import { getUserIdFromContext } from '../middlewares/AuditMiddleware.js';
import { sequelize } from '../models/index.js';

/**
 * @swagger
 * tags:
 *  name: Gestion des Dossiers
 *  description: Centralisation des informations pour chaque client/contrat, suivi de l'état d'avancement des dossiers, et liaison avec les sinistres et l'historique des événements.
 */

/**
 * @swagger
 * /api/dossiers:
 *   post:
 *     summary: Créer un nouveau dossier
 *     description: Crée un nouveau dossier et le lie à un contrat d'assurance et à un état initial.
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_dossier
 *               - id_contrat
 *               - id_etat_dos
 *             properties:
 *               numero_dossier:
 *                 type: string
 *                 description: Numéro unique du dossier.
 *                 example: "DOSS-2024-0001"
 *               titre:
 *                 type: string
 *                 nullable: true
 *                 description: Titre ou sujet du dossier.
 *                 example: "Dossier de sinistre voiture A. Dupont"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Description détaillée du dossier.
 *                 example: "Suivi du sinistre n°XYZ lié au contrat auto."
 *               id_contrat:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) du contrat d'assurance associé.
 *                 example: "d1e2f3a4-b5c6-7890-1234-567890abcdef"
 *               id_etat_dos:
 *                 type: string
 *                 format: uuid
 *                 description: ID (UUID) de l'état initial du dossier.
 *                 example: "f1e2d3c4-a5b6-7890-1234-567890abcdef"
 *     responses:
 *       201:
 *         description: Dossier créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dossier'
 *       400:
 *         description: Requête invalide (données manquantes, numéro de dossier déjà utilisé, contrat/état non trouvés).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/dossiers:
 *   get:
 *     summary: Obtenir tous les dossiers
 *     description: Récupère la liste de tous les dossiers enregistrés, avec options de filtrage.
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id_contrat
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID (UUID) optionnel du contrat pour filtrer les dossiers.
 *       - name: id_etat_dos
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID (UUID) optionnel de l'état du dossier pour filtrer.
 *     responses:
 *       200:
 *         description: Liste des dossiers obtenue avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dossier'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       500:
 *         description: Erreur serveur.
 */
export const createDossier = async (req, res) => {
  const { numero_dossier, titre, description, id_contrat, id_etat_dos } = req.body;

  if (!numero_dossier || !id_contrat || !id_etat_dos) {
    return res.status(400).json({ message: 'Le numéro de dossier, l\'ID du contrat et l\'ID de l\'état sont obligatoires.' });
  }

  try {
    const userId = getUserIdFromContext();
    //const t = await sequelize.transaction();

    const dossierExists = await Dossier.findOne({ where: { numero_dossier } }, { 
      //transaction: t
     });
    if (dossierExists) {
      return res.status(400).json({ message: 'Un dossier avec ce numéro existe déjà.' });
    }

    const contrat = await ContratAssurance.findByPk(id_contrat);
    if (!contrat) return res.status(400).json({ message: 'Contrat d\'assurance non trouvé.' });

    const etatDoss = await EtatDossier.findByPk(id_etat_dos);
    if (!etatDoss) return res.status(400).json({ message: 'État du dossier non trouvé.' });

    // Vérifier si le contrat est déjà lié à un dossier
    const existingDossierForContract = await Dossier.findOne({ where: { id_contrat } });
    if (existingDossierForContract) {
      return res.status(400).json({ message: 'Ce contrat est déjà lié à un autre dossier.' });
    }


    const newDossier = await Dossier.create({
      numero_dossier,
      titre: titre || null,
      description: description || null,
      id_contrat,
      id_etat_dos
    }, {
      // transaction: t, 
       userId : userId });

    //await t.commit();

    res.status(201).json({ message: 'Dossier créé avec succès.', dossier: newDossier });
  } catch (error) {
    //await t.rollback();
    console.error('Erreur lors de la création du dossier:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({ message: `Le champ '${field}' est déjà utilisé.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation des données.', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création du dossier.' });
  }
};

export const getAllDossiers = async (req, res) => {
  const { id_contrat, id_etat_dos } = req.query;
  let whereClause = {};

  if (id_contrat) {
    whereClause.id_contrat = id_contrat;
  }
  if (id_etat_dos) {
    whereClause.id_etat_dos = id_etat_dos;
  }

  try {
    const dossiers = await Dossier.findAll({
      where: whereClause,
      order: [['date_creation', 'DESC']],
      include: [
        { model: ContratAssurance, as: 'contrat_principal', attributes: ['id_police','id_contrat', 'numero_contrat', 'statut_contrat'] },
        { model: EtatDossier, as: 'etat_actuel', attributes: ['id_etat_dossier', 'nom_etat'] },
        // { model: Sinistre, as: 'sinistres_lies' }, // Inclure les sinistres associés si besoin
        // { model: HistoriqueEvent, as: 'historique_dossier' } // Inclure l'historique si besoin
      ]
    });
    res.status(200).json(dossiers);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les dossiers:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des dossiers.' });
  }
};


/**
 * @swagger
 * /api/dossiers/{id}:
 *   get:
 *     summary: Obtenir un dossier par ID
 *     description: Récupère les détails d'un dossier spécifique par son ID. Inclut les informations du contrat et de l'état.
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du dossier.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dossier obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dossier'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Dossier non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   put:
 *     summary: Mettre à jour un dossier
 *     description: Met à jour les informations d'un dossier existant par son ID.
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du dossier à mettre à jour.
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
 *               numero_dossier:
 *                 type: string
 *                 description: Nouveau numéro unique du dossier.
 *                 example: "DOSS-2024-0001-MOD"
 *               titre:
 *                 type: string
 *                 nullable: true
 *                 description: Nouveau titre ou sujet du dossier.
 *                 example: "Mise à jour du dossier de sinistre voiture A. Dupont"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Nouvelle description détaillée du dossier.
 *                 example: "Mise à jour suite à la réception des documents complémentaires."
 *               id_contrat:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID (UUID) du contrat d'assurance associé.
 *                 example: "d1e2f3a4-b5c6-7890-1234-567890abcdeg"
 *               id_etat_dos:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID (UUID) de l'état du dossier.
 *                 example: "f1e2d3c4-a5b6-7890-1234-567890abcefg"
 *     responses:
 *       200:
 *         description: Dossier mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dossier'
 *       400:
 *         description: Requête invalide (numéro de dossier déjà utilisé, contrat/état non trouvés).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Dossier non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   delete:
 *     summary: Supprimer un dossier
 *     description: Supprime un dossier spécifique par son ID. (Généralement réservé aux admins).
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du dossier à supprimer.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dossier supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Dossier non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const getDossierById = async (req, res) => {
  try {
    const dossier = await Dossier.findByPk(req.params.id, {
      include: [
        { model: ContratAssurance, as: 'contrat_principal', attributes: ['id_police', 'numero_contrat', 'statut'] },
        { model: EtatDossier, as: 'etat_actuel', attributes: ['id_etat_dos', 'nom_etat'] },
        // { model: Sinistre, as: 'sinistres_lies' }, // Décommentez pour inclure les sinistres
        // { model: HistoriqueEvent, as: 'historique_dossier' } // Décommentez pour inclure l'historique
      ]
    });

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé.' });
    }
    res.status(200).json(dossier);
  } catch (error) {
    console.error('Erreur lors de la récupération du dossier par ID:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du dossier.' });
  }
};

export const updateDossier = async (req, res) => {
  const { numero_dossier, titre, description, id_contrat, id_etat_dos } = req.body;
  const { id } = req.params;

  try {

    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const dossier = await Dossier.findByPk(id, { transaction: t });

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé.' });
    }

    // Vérifier si le nouveau numéro de dossier est déjà pris par un autre dossier
    if (numero_dossier && numero_dossier !== dossier.numero_dossier) {
      const existingDossier = await Dossier.findOne({ where: { numero_dossier } });
      if (existingDossier) {
        return res.status(400).json({ message: 'Le nouveau numéro de dossier est déjà utilisé.' });
      }
      dossier.numero_dossier = numero_dossier;
    }

    // Vérifier l'existence des entités liées si leurs IDs sont fournis et différents
    if (id_contrat && id_contrat !== dossier.id_contrat) {
        const contrat = await ContratAssurance.findByPk(id_contrat);
        if (!contrat) return res.status(400).json({ message: 'Nouveau contrat d\'assurance non trouvé.' });

        // Vérifier si le nouveau contrat est déjà lié à un autre dossier
        const existingDossierForNewContract = await Dossier.findOne({ where: { id_contrat } });
        if (existingDossierForNewContract && existingDossierForNewContract.id_dossier !== id) {
            return res.status(400).json({ message: 'Ce contrat est déjà lié à un autre dossier.' });
        }
        dossier.id_contrat = id_contrat;
    }

    if (id_etat_dos && id_etat_dos !== dossier.id_etat_dos) {
        const etatDoss = await EtatDossier.findByPk(id_etat_dos);
        if (!etatDoss) return res.status(400).json({ message: 'Nouvel état du dossier non trouvé.' });
        dossier.id_etat_dos = id_etat_dos;
    }

    // Mettre à jour les autres champs
    if (titre !== undefined) dossier.titre = titre;
    if (description !== undefined) dossier.description = description;

    await dossier.save({ transaction: t, userId: userId });
    await t.commit();

    res.status(200).json({ message: 'Dossier mis à jour avec succès.', dossier });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du dossier:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      return res.status(400).json({ message: `Le champ '${field}' est déjà utilisé.` });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du dossier.' });
  }
};

export const deleteDossier = async (req, res) => {
  try {

    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();
    const dossier = await Dossier.findByPk(req.params.id,{ transaction: t });

    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé.' });
    }

    // TODO: Implémenter ici une logique de vérification ou de suppression en cascade.
    // Par exemple, délier les sinistres et l'historique avant de supprimer.
    // Ou configurer onDelete dans les associations (ex: onDelete: 'SET NULL' ou 'CASCADE').

    await dossier.destroy({ transaction: t, userId: userId });

    await t.commit();
    res.status(200).json({ message: 'Dossier supprimé avec succès.' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la suppression du dossier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du dossier.' });
  }
};

/**
 * @swagger
 * /api/dossiers/{id}/sinistres:
 *   get:
 *     summary: Obtenir les sinistres liés à un dossier
 *     description: Récupère la liste de tous les sinistres associés à un dossier spécifique.
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du dossier.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sinistres du dossier obtenus avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dossier_id:
 *                   type: string
 *                   format: uuid
 *                 sinistres:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sinistre'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Dossier non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const getDossierSinistres = async (req, res) => {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé.' });
    }

    const sinistres = await Sinistre.findAll({
      where: { id_dossier: req.params.id },
      order: [['date_declaration', 'DESC']]
    });

    res.status(200).json({ dossier_id: dossier.id_dossier, sinistres });
  } catch (error) {
    console.error('Erreur lors de la récupération des sinistres du dossier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des sinistres.' });
  }
};

/**
 * @swagger
 * /api/dossiers/{id}/history:
 *   get:
 *     summary: Obtenir l'historique d'un dossier
 *     description: Récupère la liste de tous les événements historiques associés à un dossier spécifique.
 *     tags: [Gestion des Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du dossier.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Historique du dossier obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dossier_id:
 *                   type: string
 *                   format: uuid
 *                 history:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Historique'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Dossier non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const getDossierHistory = async (req, res) => {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier non trouvé.' });
    }

    const history = await HistoriqueEvent.findAll({
      where: { id_dossier: req.params.id },
      order: [['date_evenement', 'DESC']]
    });

    res.status(200).json({ dossier_id: dossier.id_dossier, history });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique du dossier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique.' });
  }
};
