// src/controllers/ClientController.js
import Client from '../models/ClientModel.js';
import HistoriqueEvent from '../models/HistoriqueEventModel.js';
import Document from '../models/DocumentModel.js';
import { Op } from 'sequelize'; // Pour des opérateurs Sequelize comme Op.ne
import { getUserIdFromContext } from '../middlewares/AuditMiddleware.js';
import { sequelize } from '../models/index.js';

// @desc    Créer un nouveau client
// @route   POST /api/clients
// @access  Private/Agent, Admin
const createClient = async (req, res) => {
  const { nom, prenom, email, telephone, telephone1, adresse, numero_identite } = req.body;

  // Validation simple
  if (!nom || !email || !telephone || !numero_identite) {
    return res.status(400).json({ message: 'Les champs sont obligatoires.' });
  }

  try {
    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();
    
    // Vérifier si un client avec cet email existe déjà
    const clientExists = await Client.findOne({ where: { email } }, { transaction: t });
    if (clientExists) {
      return res.status(400).json({ message: 'Un client avec cet email existe déjà.' });
    }
    let tel = `${telephone} ou ${telephone1}`;
    const newClient = await Client.create({
      nom,
      prenom,
      email,
      telephone: tel,
      adresse: adresse,
      numero_identite
    }, { transaction: t, userId : userId });

    await t.commit();

    res.status(201).json({ message: 'Client créé avec succès.', client: newClient });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la création du client:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé pour un autre client.' });
    }
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation des données.', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création du client.' });
  }
};

// @desc    Obtenir tous les clients
// @route   GET /api/clients
// @access  Private/Agent, Admin
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['nom', 'ASC']] // Tri par nom
    });
    res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les clients:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des clients.' });
  }
};

// @desc    Obtenir un client par ID
// @route   GET /api/clients/:id
// @access  Private/Agent, Admin
const getClientById = async (req, res) => {
  try {
    const { id } = req.params; // Paramètre de recherche par ID
    const { email } = req.query; // Paramètre de recherche par email

    let client = null;
    if (email) {
      client = await Client.findOne({ where: { email } });
    } else if (id) {
      client = await Client.findByPk(id);
    }

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Erreur lors de la récupération du client par ID:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du client.' });
  }
};

// @desc    Mettre à jour un client
// @route   PUT /api/clients/:id
// @access  Private/Agent, Admin
const updateClient = async (req, res) => {
  const { nom, email, telephone,telephone1, adresse } = req.body;

  try {
    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const { id_client } = req.params; // Paramètre de recherche par ID
    const { email } = req.query; // Paramètre de recherche par email

    let client = null;
    if (email) {
      client = await Client.findOne({ where: { email } }, { transaction: t });
    } else if (id_client) {
      client = await Client.findByPk(id_client);
    }

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    // Mettre à jour les champs si fournis
    if (nom) client.nom = nom;
    if (email) {
      // Vérifier si le nouvel email est déjà pris par un autre client
      const clientWithSameEmail = await Client.findOne({
        where: {
          email,
          id_client: { [Op.ne]: req.params.id } // Exclure le client actuel
        }
      });
      if (clientWithSameEmail) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre client.' });
      }
      client.email = email;
    }
    let tel = `${telephone} ou ${telephone1}`;
    if (telephone) client.telephone = tel;
    if (adresse) client.adresse = adresse;

    await client.save({ transaction: t , userId : userId});

    await t.commit();

    res.status(200).json({ message: 'Client mis à jour avec succès.', client });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du client:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du client.' });
  }
};

// @desc    Supprimer un client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res) => {
  try {
    const userId = getUserIdFromContext();
    const t = await sequelize.transaction();

    const { id_client } = req.params; // Paramètre de recherche par ID
    const { email } = req.query; // Paramètre de recherche par email

    let client = null;
    if (email) {
      client = await Client.findOne({ where: { email } }, { transaction: t });
    } else if (id_client) {
      client = await Client.findByPk(id_client);
    }

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    // Implémenter ici une logique de suppression en cascade si nécessaire
    // Par exemple, délier les contrats, ou refuser la suppression si des contrats/sinistres y sont liés

    await client.destroy({ transaction: t , userId : userId});

    await t.commit();
    res.status(200).json({ message: 'Client supprimé avec succès.' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du client.' });
  }
};

// @desc    Obtenir l'historique d'un client
// @route   GET /api/clients/:id/history
// @access  Private/Agent, Admin
const getClientHistory = async (req, res) => {
  try {
    const { id_client } = req.params; // Paramètre de recherche par ID
    const { email } = req.query; // Paramètre de recherche par email

    let client = null;
    if (email) {
      client = await Client.findOne({ where: { email } });
    } else if (id_client) {
      client = await Client.findByPk(id_client);
    }
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    // Récupérer l'historique lié à ce client
    const history = await HistoriqueEvent.findAll({
      where: { [Op.or]: [{ id_client: req.params.id }, { email: email }] },
      order: [['date_evenement', 'DESC']]
    });

    res.status(200).json({ client_id: client.id_client, history });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique du client:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique.' });
  }
};

// @desc    Obtenir les documents d'un client
// @route   GET /api/clients/:id/documents
// @access  Private/Agent, Admin
const getClientDocuments = async (req, res) => {
  try {
    const { id_client } = req.params; // Paramètre de recherche par ID
    const { email } = req.query; // Paramètre de recherche par email

    let client = null;
    if (email) {
      client = await Client.findOne({ where: { email } });
    } else if (id_client) {
      client = await Client.findByPk(id_client);
    }
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    // Récupérer les documents liés à ce client
    const documents = await Document.findAll({
      where: { [Op.or]: [{ id_client: req.params.id }, { email: email }] },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ client_id: client.id_client, documents });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents du client:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des documents.' });
  }
};

export { createClient, updateClient, deleteClient, getClientHistory, getClientDocuments, getAllClients, getClientById };
