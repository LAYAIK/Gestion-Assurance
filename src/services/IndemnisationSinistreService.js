// src/services/indemnisationSinistreService.js
import IndemnisationSinistre from '../models/IndemnisationSinistreModel.js';
import Sinistre from '../models/SinistreModel.js';
import HistoriqueEvent from '../models/HistoriqueEventModel.js';
import { sequelize } from '../models/index.js'; // Pour les transactions
import { Op } from 'sequelize'; // Pour les opérateurs Sequelize

class IndemnisationSinistreService {

  /**
   * Propose un montant d'indemnisation pour un sinistre.
   * @param {string} id_sinistre - L'ID du sinistre concerné.
   * @param {number} montant_propose - Le montant proposé pour l'indemnisation.
   * @param {string} description - Description de la proposition.
   * @param {string} userId - L'ID de l'utilisateur qui effectue l'action.
   * @returns {Promise<IndemnisationSinistre>} L'objet indemnisation créé.
   * @throws {Error} Si le sinistre n'est pas trouvé ou si une indemnisation est déjà en cours.
   */
  static async proposerIndemnisation(id_sinistre, montant_propose, description, userId) {
    const t = await sequelize.transaction();
    try {
      const sinistre = await Sinistre.findByPk(id_sinistre, { transaction: t });
      if (!sinistre) {
        throw new Error('Sinistre non trouvé');
      }

      const existingIndemnisation = await IndemnisationSinistre.findOne({
        where: {
          id_sinistre: id_sinistre,
          statut: { [Op.in]: ['En attente de validation', 'Validée', 'En cours de paiement', 'Payée'] }
        },
        transaction: t
      });

      if (existingIndemnisation) {
        throw new Error('Une indemnisation est déjà en cours ou a déjà été traitée pour ce sinistre.');
      }

      const indemnisation = await IndemnisationSinistre.create({
        id_sinistre: id_sinistre,
        montant: montant_propose,
        statut: 'En attente de validation',
        description_indemnisation: description
      }, { transaction: t });

      await HistoriqueEvent.create({
        type_evenement: 'Proposition Indemnisation',
        description: `Proposition d'indemnisation de ${montant_propose} € pour le sinistre ${sinistre.id_sinistre}.`,
        entite_affectee: 'IndemnisationSinistre',
        id_entite_affectee: indemnisation.id_indemnisation,
        valeurs_apres: indemnisation.toJSON(),
        utilisateur_id: userId
      }, { transaction: t });

      await t.commit();
      return indemnisation;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Valide (approuve) une indemnisation proposée.
   * @param {string} id_indemnisation - L'ID de l'indemnisation à valider.
   * @param {string} userId - L'ID de l'utilisateur qui valide.
   * @returns {Promise<IndemnisationSinistre>} L'objet indemnisation mis à jour.
   * @throws {Error} Si l'indemnisation n'est pas trouvée ou si son statut n'est pas 'En attente de validation'.
   */
  static async validerIndemnisation(id_indemnisation, userId) {
    const t = await sequelize.transaction();
    try {
      const indemnisation = await IndemnisationSinistre.findByPk(id_indemnisation, { transaction: t });
      if (!indemnisation) {
        throw new Error('Indemnisation non trouvée');
      }

      if (indemnisation.statut !== 'En attente de validation') {
        throw new Error(`L'indemnisation n'est pas en statut 'En attente de validation'. Statut actuel: ${indemnisation.statut}`);
      }

      const oldStatus = indemnisation.statut;
      indemnisation.statut = 'Validée';
      await indemnisation.save({ transaction: t });

      await HistoriqueEvent.create({
        type_evenement: 'Validation Indemnisation',
        description: `Indemnisation ${indemnisation.id_indemnisation} validée pour un montant de ${indemnisation.montant} €.`,
        entite_affectee: 'IndemnisationSinistre',
        id_entite_affectee: indemnisation.id_indemnisation,
        valeurs_avant: { statut: oldStatus },
        valeurs_apres: { statut: 'Validée' },
        utilisateur_id: userId
      }, { transaction: t });

      await t.commit();
      return indemnisation;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Enregistre le paiement effectif d'une indemnisation.
   * @param {string} id_indemnisation - L'ID de l'indemnisation à payer.
   * @param {object} paiementDetails - Détails du paiement (date_paiement, mode_paiement, reference_paiement).
   * @param {string} userId - L'ID de l'utilisateur qui enregistre le paiement.
   * @returns {Promise<IndemnisationSinistre>} L'objet indemnisation mis à jour.
   * @throws {Error} Si l'indemnisation n'est pas trouvée ou si son statut n'est pas 'Validée'.
   */
  static async enregistrerPaiementIndemnisation(id_indemnisation, paiementDetails, userId) {
    const { date_paiement, mode_paiement, reference_paiement } = paiementDetails;
    const t = await sequelize.transaction();
    try {
      const indemnisation = await IndemnisationSinistre.findByPk(id_indemnisation, { transaction: t });
      if (!indemnisation) {
        throw new Error('Indemnisation non trouvée');
      }

      if (indemnisation.statut !== 'Validée') {
        throw new Error(`L'indemnisation n'est pas au statut 'Validée'. Statut actuel: ${indemnisation.statut}`);
      }

      const oldValues = indemnisation.toJSON();
      indemnisation.date_paiement = date_paiement || new Date();
      indemnisation.mode_paiement = mode_paiement;
      indemnisation.reference_paiement = reference_paiement;
      indemnisation.statut = 'Payée';
      await indemnisation.save({ transaction: t });

      await HistoriqueEvent.create({
        type_evenement: 'Paiement Indemnisation Enregistré',
        description: `Paiement de l'indemnisation ${indemnisation.id_indemnisation} (montant: ${indemnisation.montant} €) enregistré.`,
        entite_affectee: 'IndemnisationSinistre',
        id_entite_affectee: indemnisation.id_indemnisation,
        valeurs_avant: { statut: oldValues.statut, date_paiement: oldValues.date_paiement, mode_paiement: oldValues.mode_paiement, reference_paiement: oldValues.reference_paiement },
        valeurs_apres: { statut: 'Payée', date_paiement, mode_paiement, reference_paiement },
        utilisateur_id: userId
      }, { transaction: t });

      await t.commit();
      return indemnisation;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Récupère toutes les indemnisations avec des options de filtrage et de pagination.
   * @param {object} filters - Les filtres (statut, id_sinistre, date_debut, date_fin).
   * @param {number} page - Le numéro de la page.
   * @param {number} limit - La limite d'éléments par page.
   * @returns {Promise<{count: number, rows: IndemnisationSinistre[]}>} Un objet contenant le nombre total et les indemnisations.
   */
  static async getIndemnisations(filters, page, limit) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (filters.statut) where.statut = filters.statut;
    if (filters.id_sinistre) where.id_sinistre = filters.id_sinistre;
    if (filters.date_debut || filters.date_fin) {
      where.date_paiement = {};
      if (filters.date_debut) where.date_paiement[Op.gte] = new Date(filters.date_debut);
      if (filters.date_fin) where.date_paiement[Op.lte] = new Date(filters.date_fin);
    }

    return await IndemnisationSinistre.findAndCountAll({
      where,
      include: [
        { model: Sinistre, as: 'sinistre', attributes: ['id_sinistre', 'reference_sinistre', 'date_declaration'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  }

  /**
   * Récupère une indemnisation par son ID.
   * @param {string} id_indemnisation - L'ID de l'indemnisation.
   * @returns {Promise<IndemnisationSinistre>} L'objet indemnisation.
   * @throws {Error} Si l'indemnisation n'est pas trouvée.
   */
  static async getIndemnisationById(id_indemnisation) {
    const indemnisation = await IndemnisationSinistre.findByPk(id_indemnisation, {
      include: [
        { model: Sinistre, as: 'sinistre', attributes: ['id_sinistre', 'reference_sinistre', 'date_declaration'] }
      ]
    });
    if (!indemnisation) {
      throw new Error('Indemnisation non trouvée');
    }
    return indemnisation;
  }
}

export default IndemnisationSinistreService;