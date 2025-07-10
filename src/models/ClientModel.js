// src/models/ClientModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Utilisateur from './UtilisateurModel.js';
import HistoriqueEvent from './HistoriqueEventModel.js';


/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id_client:
 *           type: string
 *           format: uuid
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         email:
 *           type: string
 *         telephone:
 *           type: string
 *         numero_identite:
 *           type: string
 *         numero_permis_conduire:
 *           type: string
 *         adresse:
 *           type: string
 */

const Client = sequelize.define('Client', {
  id_client: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom: { // Ajout d'un nom pour le client
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telephone: {
    type: DataTypes.STRING(20)
  },
  numero_identite: { // Champ pour la carte d'identité ou CIN
    type: DataTypes.STRING(50),
    allowNull: true // Peut être null si le client ne fournit pas de CIN
  },
  numero_permis_conduire: {
    type: DataTypes.STRING(50),
    allowNull: true // Peutêtre null si le client ne fournit pas de permis de conduire
  },
  adresse: {
    type: DataTypes.STRING(255)
  }
  // Vous pouvez ajouter d'autres attributs ici comme date de naissance, CIN, etc.
}, {
  tableName: 'Clients',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ],
    hooks: {
    afterCreate: async (client, options) => {
      // Supposons que vous ayez accès à l'utilisateur qui effectue l'action à partir des options ou d'un contexte
      const userId = options.userId || null; // Obtenir l'ID de l'utilisateur à partir de la transaction/du contexte

      await HistoriqueEvent.create({
        type_evenement: 'Création Client',
        description: `Client de référence ${client.numero_identite} créé.`,
        entite_affectee: 'Client',
        id_entite_affectee: client.id_client,
        valeurs_apres: client.toJSON(), // Enregistrer toutes les nouvelles valeurs
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterUpdate: async (client, options) => {
      const changedFields = client.changed();
      if (!changedFields || changedFields.length === 0) return; // Aucune modification à enregistrer

      const userId = options.userId || null;

      const previousData = client._previousDataValues;
      const currentData = client.toJSON();

      // Filtrer les modifications réelles et préparer les valeurs avant/après
      const valeurs_avant = {};
      const valeurs_apres = {};
      let description_changes = 'Changements: ';

      changedFields.forEach(field => {
        valeurs_avant[field] = previousData[field];
        valeurs_apres[field] = currentData[field];
        description_changes += `${field}: '${previousData[field]}' -> '${currentData[field]}'; `;
      });

      await HistoriqueEvent.create({
        type_evenement: 'Modification Client',
        description: `Client de référence ${client.numero_identite} modifié. ${description_changes}`,
        entite_affectee: 'Client',
        id_entite_affectee: client.id_client,
        valeurs_avant: valeurs_avant,
        valeurs_apres: valeurs_apres,
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterDestroy: async (client, options) => {
      const userId = options.userId || null;

      await HistoriqueEvent.create({
        type_evenement: 'Suppression Client',
        description: `Client de référence ${client.numero_identite} supprimé.`,
        entite_affectee: 'Client',
        id_entite_affectee: client.id_client,
        valeurs_avant: client.toJSON(), // Enregistrer ce qui a été supprimé
        utilisateur_id: userId
      },
      { transaction: options.transaction });
    }
  }
});

export default Client;
