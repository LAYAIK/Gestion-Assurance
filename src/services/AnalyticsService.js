// src/services/analyticsService.js
import ContratAssurance from '../models/ContratAssuranceModel.js';
import Sinistre from '../models/SinistreModel.js';
import PrimeAssurance from '../models/PrimeAssuranceModel.js';
import Client from '../models/ClientModel.js'; // Assurez-vous d'avoir ce modèle
import Utilisateur from '../models/UtilisateurModel.js'; // Assurez-vous d'avoir ce modèle
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class AnalyticsService {

  /**
   * Récupère le nombre de polices actives, expirées, en attente, etc.
   * @returns {Promise<object>} Un objet avec le compte par statut de contrat.
   */
  static async getContratStatusOverview() {
    const statusCounts = await ContratAssurance.findAll({
      attributes: [
        'statut_contrat',
        [sequelize.fn('COUNT', sequelize.col('id_contrat')), 'count']
      ],
      group: ['statut_contrat']
    });

    const result = {};
    statusCounts.forEach(item => {
      result[item.statut_contrat] = parseInt(item.dataValues.count, 10);
    });
    return result;
  }

  /**
   * Récupère la répartition des sinistres par statut.
   * @returns {Promise<object>} Un objet avec le compte par statut de sinistre.
   */
  static async getSinistreStatusOverview() {
    const statusCounts = await Sinistre.findAll({
      attributes: [
        'statut_sinistre',
        [sequelize.fn('COUNT', sequelize.col('id_sinistre')), 'count']
      ],
      group: ['statut_sinistre']
    });

    const result = {};
    statusCounts.forEach(item => {
      result[item.statut_sinistre] = parseInt(item.dataValues.count, 10);
    });
    return result;
  }

  /**
   * Récupère la répartition des contrats par type d'assurance.
   * @returns {Promise<object>} Un objet avec le compte par type d'assurance.
   */
  static async getContratTypeDistribution() {
    const typeCounts = await ContratAssurance.findAll({
      attributes: [
        'id_type_assurance', // Supposons que vous avez un champ 'id_type_assurance'
        [sequelize.fn('COUNT', sequelize.col('id_contrat')), 'count']
      ],
      group: ['id_type_assurance']
    });

    const result = {};
    typeCounts.forEach(item => {
      result[item.type_assurance] = parseInt(item.dataValues.count, 10);
    });
    return result;
  }

  /**
   * Récupère les primes collectées sur une période donnée.
   * @param {string} startDate - Date de début (YYYY-MM-DD).
   * @param {string} endDate - Date de fin (YYYY-MM-DD).
   * @returns {Promise<number>} Le montant total des primes payées.
   */
  static async getTotalPrimesCollected(startDate, endDate) {
    const total = await PrimeAssurance.sum('montant', {
      where: {
        statut: 'Payée',
        date_paiement: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });
    return total || 0;
  }

  /**
   * Récupère les montants d'indemnisation payés sur une période donnée.
   * @param {string} startDate - Date de début (YYYY-MM-DD).
   * @param {string} endDate - Date de fin (YYYY-MM-DD).
   * @returns {Promise<number>} Le montant total des indemnisations payées.
   */
  static async getTotalIndemnisationsPaid(startDate, endDate) {
    const total = await sequelize.models.IndemnisationSinistre.sum('montant', { // Utilisez sequelize.models pour accéder à IndemnisationSinistre
      where: {
        statut: 'Payée',
        date_paiement: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });
    return total || 0;
  }

  /**
   * Récupère l'évolution du nombre de nouveaux clients par mois.
   * @returns {Promise<object[]>} Tableau d'objets { month: 'YYYY-MM', count: N }
   */
  static async getNewClientsEvolution() {
    const newClients = await Client.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id_client')), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    return newClients.map(item => ({
      month: item.dataValues.month.toISOString().substring(0, 7), // Format YYYY-MM
      count: parseInt(item.dataValues.count, 10)
    }));
  }

  /**
   * Récupère les top N sinistres les plus coûteux (pour des rapports).
   * @param {number} limit - Nombre de sinistres à retourner.
   * @returns {Promise<Sinistre[]>} Tableau des sinistres avec leur indemnisation.
   */
  static async getTopCostlySinistres(limit = 5) {
    // Effectuer d'abord le LEFT OUTER JOIN, puis agréger les indemnisations par sinistre
    const costlySinistres = await Sinistre.findAll({
      attributes: [
        'id_sinistre',
        'reference_sinistre',
        'date_declaration',
        'description_sinistre',
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('indemnisations.montant')), 0), 'total_indemnisation']
      ],
      include: [{
        model: sequelize.models.IndemnisationSinistre,
        as: 'indemnisations',
        attributes: [],
        required: false // LEFT OUTER JOIN pour inclure tous les sinistres, même sans indemnisation
      }],
      group: [
        'Sinistre.id_sinistre',
        'Sinistre.reference_sinistre',
        'Sinistre.date_declaration',
        'Sinistre.description_sinistre'
      ],
      order: [[sequelize.literal('total_indemnisation'), 'DESC']],
      limit: limit,
      subQuery: false
    });

    return costlySinistres.map(s => ({
      id_sinistre: s.id_sinistre,
      reference_sinistre: s.reference_sinistre,
      date_declaration: s.date_declaration,
      description_sinistre: s.description_sinistre,
      total_indemnisation: parseFloat(s.dataValues.total_indemnisation)
    }));
  }

    /**
   * Récupère les données des primes par mois pour une période donnée.
   * @param {string} startDate - Date de début (YYYY-MM-DD).
   * @param {string} endDate - Date de fin (YYYY-MM-DD).
   * @returns {Promise<object[]>} Tableau d'objets { month: 'YYYY-MM', amount: N }
   */
  static async getPrimesByMonth(startDate, endDate) {
    const primesData = await PrimeAssurance.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_paiement')), 'month'],
        [sequelize.fn('SUM', sequelize.col('montant')), 'total_amount']
      ],
      where: {
        statut: 'Payée',
        date_paiement: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_paiement'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_paiement')), 'ASC']]
    });

    return primesData.map(item => ({
      month: item.dataValues.month.toISOString().substring(0, 7),
      amount: parseFloat(item.dataValues.total_amount)
    }));
  }
}

export default AnalyticsService;