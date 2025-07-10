// src/controllers/indemnisationSinistreController.js
import IndemnisationSinistreService from '../services/IndemnisationSinistreService.js';
import { getUserIdFromContext } from '../middlewares/AuditMiddleware.js'; // Pour récupérer le user_id

/**
 * Gère la requête pour proposer un montant d'indemnisation.
 */
export const proposerIndemnisation = async (req, res) => {
  const userId = getUserIdFromContext();
  const { id_sinistre } = req.params;
  const { montant_propose, description } = req.body;

  try {
    const indemnisation = await IndemnisationSinistreService.proposerIndemnisation(
      id_sinistre,
      montant_propose,
      description,
      userId
    );
    res.status(201).json(indemnisation);
  } catch (error) {
    console.error('Erreur dans le contrôleur (proposerIndemnisation):', error);
    res.status(error.message.includes('non trouvé') || error.message.includes('en cours') ? 404 : 500).json({ message: error.message });
  }
};

/**
 * Gère la requête pour valider (approuver) une indemnisation.
 */
export const validerIndemnisation = async (req, res) => {
  const userId = getUserIdFromContext();
  const { id_indemnisation } = req.params;

  try {
    const indemnisation = await IndemnisationSinistreService.validerIndemnisation(
      id_indemnisation,
      userId
    );
    res.status(200).json(indemnisation);
  } catch (error) {
    console.error('Erreur dans le contrôleur (validerIndemnisation):', error);
    res.status(error.message.includes('non trouvée') || error.message.includes('statut') ? 404 : 500).json({ message: error.message });
  }
};

/**
 * Gère la requête pour enregistrer le paiement effectif d'une indemnisation.
 */
export const enregistrerPaiementIndemnisation = async (req, res) => {
  const userId = getUserIdFromContext();
  const { id_indemnisation } = req.params;
  const paiementDetails = req.body; // Contient date_paiement, mode_paiement, reference_paiement

  try {
    const indemnisation = await IndemnisationSinistreService.enregistrerPaiementIndemnisation(
      id_indemnisation,
      paiementDetails,
      userId
    );
    res.status(200).json(indemnisation);
  } catch (error) {
    console.error('Erreur dans le contrôleur (enregistrerPaiementIndemnisation):', error);
    res.status(error.message.includes('non trouvée') || error.message.includes('statut') ? 404 : 500).json({ message: error.message });
  }
};

/**
 * Gère la requête pour récupérer toutes les indemnisations.
 */
export const getIndemnisations = async (req, res) => {
  const { statut, id_sinistre, date_debut, date_fin, page, limit } = req.query;
  const filters = { statut, id_sinistre, date_debut, date_fin };

  try {
    const { count, rows: indemnisations } = await IndemnisationSinistreService.getIndemnisations(
      filters,
      page || 1,
      limit || 10
    );
    res.status(200).json({ total: count, page: parseInt(page) || 1, limit: parseInt(limit) || 10, indemnisations });
  } catch (error) {
    console.error('Erreur dans le contrôleur (getIndemnisations):', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des indemnisations', error: error.message });
  }
};

/**
 * Gère la requête pour récupérer une indemnisation par son ID.
 */
export const getIndemnisationById = async (req, res) => {
  const { id_indemnisation } = req.params;
  try {
    const indemnisation = await IndemnisationSinistreService.getIndemnisationById(id_indemnisation);
    res.status(200).json(indemnisation);
  } catch (error) {
    console.error('Erreur dans le contrôleur (getIndemnisationById):', error);
    res.status(error.message.includes('non trouvée') ? 404 : 500).json({ message: error.message });
  }
};