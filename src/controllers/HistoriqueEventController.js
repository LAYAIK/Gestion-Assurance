// src/controllers/historiqueEventController.js
import { HistoriqueEvent, Utilisateur, ContratAssurance, Dossier, Sinistre, Client } from '../models/index.js';
import { Op } from 'sequelize';

export const getHistoriqueEvents = async (req, res) => {
  try {
    const { entite_type, entite_id, userId, type_evenement, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (entite_type) where.entite_affectee = entite_type;
    if (entite_id) where.id_entite_affectee = entite_id;
    if (userId) where.utilisateur_id = userId;
    if (type_evenement) where.type_evenement = type_evenement;
    if (startDate || endDate) {
      where.date_evenement = {};
      if (startDate) where.date_evenement[Op.gte] = new Date(startDate);
      if (endDate) where.date_evenement[Op.lte] = new Date(endDate);
    }

    const { count, rows: historiqueEvents } = await HistoriqueEvent.findAndCountAll({
      where,
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['id_utilisateur', 'nom_utilisateur', 'email'] },
        // Vous pouvez ajouter d'autres inclusions si vous voulez récupérer les objets complets
        // mais cela peut être lourd. Il est souvent suffisant d'avoir juste l'ID et le type d'entité.
        // { model: ContratAssurance, as: 'contratAssurance', required: false },
        // { model: Dossier, as: 'dossier', required: false },
        // { model: Sinistre, as: 'sinistre', required: false },
        // { model: Client, as: 'client', required: false }
      ],
      order: [['date_evenement', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      historiqueEvents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements historiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements historiques', error: error.message });
  }
};

export const getHistoriqueForEntity = async (req, res) => {
  try {
    const { entite_type, entite_id } = req.params;
    const historiqueEvents = await HistoriqueEvent.findAll({
      where: {
        entite_affectee: entite_type,
        id_entite_affectee: entite_id
      },
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['id_utilisateur', 'nom_utilisateur', 'email'] }
      ],
      order: [['date_evenement', 'DESC']]
    });
    if (!historiqueEvents || historiqueEvents.length === 0) {
      return res.status(404).json({ message: `Aucun historique trouvé pour l'entité ${entite_type} avec l'ID ${entite_id}` });
    }
    res.status(200).json(historiqueEvents);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'historique pour ${entite_type} ${entite_id}:`, error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique de l'entité", error: error.message });
  }
};