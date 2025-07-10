import Client from '../models/ClientModel.js';
import Compagnie from '../models/CompagnieModel.js';
import Utilisateur from '../models/UtilisateurModel.js';
import { Op } from 'sequelize';
import ContratAssurance from '../models/ContratAssuranceModel.js';
import TypeAssurance from '../models/TypeAssuranceModel.js';
import Vehicule from '../models/VehiculeModel.js';
import { sequelize } from '../models/index.js';
import { getUserIdFromContext } from '../middlewares/AuditMiddleware.js';


export const createContratAssurance = async (req, res) => {
  const {
    numero_contrat,
    date_debut,
    date_fin,
    montant_prime,
    statut,
    id_client,
    id_type_assurance,
    id_compagnie,
    immatriculation,
    id_utilisateur_gestionnaire
  } = req.body;

  if (!numero_contrat || !date_debut === undefined || !date_fin=== undefined || montant_prime === undefined || !id_client=== undefined || !id_type_assurance=== undefined || !id_compagnie=== undefined || !immatriculation === undefined || !id_utilisateur_gestionnaire === undefined) {
    return res.status(400).json({ message: 'Veuillez fournir toutes les informations obligatoires du contrat.' });
  }

  try {

    const userId = getUserIdFromContext(); // Récupère l'ID utilisateur du contexte
    const t = await sequelize.transaction(); // Création de la transaction
    const contratExists = await ContratAssurance.findOne({ where: { numero_contrat } });
    if (contratExists) {
      return res.status(400).json({ message: 'Un contrat avec ce numéro existe déjà.' });
    }

    // Vérifier l'existence des entités liées (Client, TypeAssurance, Compagnie)
    // const client = await Client.findByPk(id_client);
    // if (!client) return res.status(400).json({ message: 'Client non trouvé.' });

    // const typeAss = await TypeAssurance.findByPk(id_type_assurance);
    // if (!typeAss) return res.status(400).json({ message: 'Type d\'assurance non trouvé.' });

    // const compagnie = await Compagnie.findByPk(id_compagnie);
    // if (!compagnie) return res.status(400).json({ message: 'Compagnie non trouvée.' });

    // L'utilisateur gestionnaire est optionnel
    // if (id_utilisateur_gestionnaire) {
    //     const utilisateur = await Utilisateur.findByPk(id_utilisateur_gestionnaire);
    //     if (!utilisateur) return res.status(400).json({ message: 'Utilisateur gestionnaire non trouvé.' });
    // }


    const newContrat = await ContratAssurance.create({
      numero_contrat,
      date_debut,
      date_fin,
      montant_prime,
      statut: statut || 'Actif',
      id_client,
      id_type_assurance,
      id_compagnie,
      id_utilisateur_gestionnaire,
      immatriculation
    },
  {
       // transaction: t,
        userId: userId // Passe l'ID utilisateur aux options du hook
      });

    //await t.commit();
    return res.status(201).json({ message: 'Contrat d\'assurance créé avec sucesso.', contrat: newContrat });

  } catch (error) {
    //await t.rollback();
    console.error('Erreur lors de la création du contrat d\'assurance:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Le numéro de contrat est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation des données.', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création du contrat d\'assurance.' });
  }
};

export const getAllContratsAssurance = async (req, res) => {
  try {
    const contrats = await ContratAssurance.findAll({
      order: [['date_debut', 'DESC']],
      include: [ // Inclure les détails des entités liées pour une meilleure visibilité
        { model: Client, as: 'client', attributes: ['id_client', 'nom', 'prenom', 'email'] },
        { model: TypeAssurance, as: 'type_assurance', attributes: ['id_type_assurance', 'nom'] },
        { model: Compagnie, as: 'compagnie_emettrie', attributes: ['id_compagnie', 'nom_compagnie'] },
        { model: Utilisateur, as: 'gestionnaire_contrat', attributes: ['id_utilisateur', 'nom', 'email'] }
      ]
    });
    res.status(200).json(contrats);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les contrats d\'assurance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des contrats d\'assurance.' });
  }
};

/**
 * @swagger
 * /api/contrats/{id}:
 *   get:
 *     summary: Obtenir un contrat d'assurance par ID
 *     description: Récupère les détails d'un contrat d'assurance spécifique par son ID (id_police).
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du contrat d'assurance (id_police).
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contrat d'assurance obtenu avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratAssurance'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Contrat d'assurance non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   put:
 *     summary: Mettre à jour un contrat d'assurance
 *     description: Met à jour les informations d'un contrat d'assurance existant par son ID.
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du contrat d'assurance à mettre à jour (id_police).
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
 *               numero_contrat:
 *                 type: string
 *                 description: Nouveau numéro unique du contrat.
 *                 example: "POLICE-2024-0001-MOD"
 *               date_debut:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               date_fin:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-01"
 *               montant_prime:
 *                 type: number
 *                 format: float
 *                 example: 1300.00
 *               statut:
 *                 type: string
 *                 enum: [Actif, Expiré, Annulé, En attente, Renouvelé]
 *                 example: "Actif"
 *               id_client:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID du client associé.
 *                 example: "e1b2c3d4-e5f6-7890-1234-567890abcdeg"
 *               id_type_assurance:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID du type d'assurance associé.
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdeh"
 *               id_compagnie:
 *                 type: string
 *                 format: uuid
 *                 description: Nouveau ID de la compagnie d'assurance émettrice.
 *                 example: "b1c2d3e4-f5a6-7890-1234-567890abcdei"
 *               id_utilisateur_gestionnaire:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Nouveau ID de l'utilisateur qui gère ce contrat.
 *                 example: "c1d2e3f4-a5b6-7890-1234-567890abcdej"
 *     responses:
 *       200:
 *         description: Contrat d'assurance mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratAssurance'
 *       400:
 *         description: Requête invalide (données manquantes, dépendances non trouvées, numéro de contrat déjà utilisé).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Contrat d'assurance non trouvé.
 *       500:
 *         description: Erreur serveur.
 *   delete:
 *     summary: Supprimer un contrat d'assurance
 *     description: Supprime un contrat d'assurance spécifique par son ID. (Généralement réservé aux admins).
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du contrat d'assurance à supprimer (id_police).
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contrat d'assurance supprimé avec succès.
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Contrat d'assurance non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const getContratAssuranceById = async (req, res) => {
  try {
    const contrat = await ContratAssurance.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id_client', 'nom', 'prenom', 'email'] },
        { model: TypeAssurance, as: 'type_assurance', attributes: ['id_type_assurance', 'nom'] },
        { model: Compagnie, as: 'compagnie_emettrie', attributes: ['id_compagnie', 'nom_compagnie'] },
        { model: Utilisateur, as: 'gestionnaire_contrat', attributes: ['id_utilisateur', 'nom', 'email'] }
      ]
    });

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat d\'assurance non trouvé.' });
    }
    res.status(200).json(contrat);
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat d\'assurance par ID:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du contrat d\'assurance.' });
  }
};

export const updateContratAssurance = async (req, res) => {
  const {
    date_debut,
    date_fin,
    montant_prime,
    statut,
    id_client,
    id_type_assurance,
    id_compagnie,
    id_utilisateur_gestionnaire
  } = req.body;

  try {
  
    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const contrat = await ContratAssurance.findByPk(req.params.id, { transaction: t });

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat d\'assurance non trouvé.' });
    }

    // Vérifier si le nouveau numéro de contrat est déjà pris par un autre contrat
    if (numero_contrat && numero_contrat !== contrat.numero_contrat) {
      const existingContrat = await ContratAssurance.findOne({ where: { numero_contrat } });
      if (!existingContrat) {
        return res.status(400).json({ message: 'Le numéro de contrat n\'existe pas.' });
      }
    }
    // Mettre à jour les entités liées si leurs IDs sont fournis et valides
    // if (id_client && id_client !== contrat.id_client) {
    //   const client = await Client.findByPk(id_client);
    //   if (!client) return res.status(400).json({ message: 'Nouveau client non trouvé.' });
    //   contrat.id_client = id_client;
    // }
    // if (id_type_assurance && id_type_assurance !== contrat.id_type_assurance) {
    //   const typeAss = await TypeAssurance.findByPk(id_type_assurance);
    //   if (!typeAss) return res.status(400).json({ message: 'Nouveau type d\'assurance non trouvé.' });
    //   contrat.id_type_assurance = id_type_assurance;
    // }
    // if (id_compagnie && id_compagnie !== contrat.id_compagnie) {
    //   const compagnie = await Compagnie.findByPk(id_compagnie);
    //   if (!compagnie) return res.status(400).json({ message: 'Nouvelle compagnie non trouvée.' });
    //   contrat.id_compagnie = id_compagnie;
    // }
    // if (id_utilisateur_gestionnaire !== undefined && id_utilisateur_gestionnaire !== contrat.id_utilisateur_gestionnaire) {
    //     if (id_utilisateur_gestionnaire) {
    //         const utilisateur = await Utilisateur.findByPk(id_utilisateur_gestionnaire);
    //         if (!utilisateur) return res.status(400).json({ message: 'Nouvel utilisateur gestionnaire non trouvé.' });
    //     }
    //     contrat.id_utilisateur_gestionnaire = id_utilisateur_gestionnaire;
    // }

    await contrat.update(
      id_client ? { id_client } : null,
      id_type_assurance ? { id_type_assurance } : null,
      id_compagnie ? { id_compagnie } : null,
      id_utilisateur_gestionnaire ? { id_utilisateur_gestionnaire } : null,
      montant_prime !== undefined ? { montant_prime } : null,
      statut ? { statut } : null,
      date_debut ? { date_debut } : null,
      date_fin ? { date_fin } : null,
      { transaction: t ,
        userId : userId
      });

    await t.commit();
    return res.status(200).json({ message: 'Contrat d\'assurance mis à jour avec succès.', contrat });

    // Mettre à jour les autres champs
    // if (date_debut) contrat.date_debut = date_debut;
    // if (date_fin) contrat.date_fin = date_fin;
    // if (montant_prime !== undefined) contrat.montant_prime = montant_prime;
    // if (statut) contrat.statut = statut;

    // await contrat.save();
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du contrat d\'assurance:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Le numéro de contrat est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du contrat d\'assurance.' });
  }
};

export const deleteContratAssurance = async (req, res) => {
  try {

    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const contrat = await ContratAssurance.findByPk(req.params.id, { transaction: t});

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat d\'assurance non trouvé.' });
    }

    // TODO: Implémenter ici une logique de vérification ou de suppression en cascade.
    // Par exemple, vérifier si des sinistres ou dossiers sont liés avant de supprimer.
    // Vous pouvez définir une option onDelete: 'SET NULL' ou 'CASCADE' dans les associations.

    await contrat.destroy( { transaction: t , userId : userId} );
    await t.commit();
    res.status(200).json({ message: 'Contrat d\'assurance supprimé avec succès.' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la suppression du contrat d\'assurance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du contrat d\'assurance.' });
  }
};


/**
 * @swagger
 * /api/contrats/{id}/renouveler:
 *   patch:
 *     summary: Renouveler un contrat d'assurance
 *     description: Renouvelle un contrat d'assurance existant en mettant à jour sa date de fin et son statut.
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du contrat à renouveler (id_police).
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
 *               nouvelle_date_fin:
 *                 type: string
 *                 format: date
 *                 description: La nouvelle date de fin du contrat après renouvellement (AAAA-MM-JJ).
 *                 example: "2026-01-01"
 *               nouveau_montant_prime:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Le nouveau montant de la prime (optionnel).
 *                 example: 1350.00
 *     responses:
 *       200:
 *         description: Contrat renouvelé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratAssurance'
 *       400:
 *         description: Requête invalide (date de fin manquante ou antérieure à la date actuelle).
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Contrat d'assurance non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const renewContratAssurance = async (req, res) => {
  const { nouvelle_date_fin, nouveau_montant_prime } = req.body;

  if (!nouvelle_date_fin) {
    return res.status(400).json({ message: 'La nouvelle date de fin est obligatoire pour le renouvellement.' });
  }

  try {

    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const contrat = await ContratAssurance.findByPk(req.params.id, { transaction: t});

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat d\'assurance non trouvé.' });
    }

    if (new Date(nouvelle_date_fin) <= new Date(contrat.date_fin)) {
        return res.status(400).json({ message: 'La nouvelle date de fin doit être postérieure à la date de fin actuelle du contrat.' });
    }

    contrat.date_fin = nouvelle_date_fin;
    contrat.statut = 'Renouvelé'; // Mettre à jour le statut
    if (nouveau_montant_prime !== undefined) {
        contrat.montant_prime = nouveau_montant_prime;
    }

    await contrat.save({ transaction: t , userId : userId});

    await t.commit();

    res.status(200).json({ message: 'Contrat d\'assurance renouvelé avec succès.', contrat });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors du renouvellement du contrat d\'assurance:', error);
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors du renouvellement du contrat d\'assurance.' });
  }
};

/**
 * @swagger
 * /api/contrats/{id}/annuler:
 *   patch:
 *     summary: Annuler un contrat d'assurance
 *     description: Annule un contrat d'assurance existant en changeant son statut à 'Annulé'.
 *     tags: [Gestion des Contrats d'Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID (UUID) du contrat à annuler (id_police).
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contrat d'assurance annulé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContratAssurance'
 *       401:
 *         description: Non autorisé, token invalide ou manquant.
 *       403:
 *         description: Accès refusé, rôle insuffisant.
 *       404:
 *         description: Contrat d'assurance non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
export const cancelContratAssurance = async (req, res) => {
  try {
    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();
    const contrat = await ContratAssurance.findByPk(req.params.id, { transaction: t});

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat d\'assurance non trouvé.' });
    }

    if (contrat.statut === 'Annulé') {
      return res.status(400).json({ message: 'Le contrat est déjà annulé.' });
    }

    contrat.statut = 'Annulé';
    await contrat.save({ transaction: t , userId : userId}); // Utiliser la transaction si elle existe

    await t.commit();

    res.status(200).json({ message: 'Contrat d\'assurance annulé avec succès.', contrat });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de l\'annulation du contrat d\'assurance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'annulation du contrat d\'assurance.' });
  }
};
