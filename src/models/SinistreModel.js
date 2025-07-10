// src/models/SinistreModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js'; // Relation avec ContratAss
import Utilisateur from './UtilisateurModel.js'; // L'utilisateur qui gère le sinistre
import HistoriqueEvent from './HistoriqueEventModel.js';


const Sinistre = sequelize.define('Sinistre', {
  id_sinistre: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  numero_sinistre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  date_declaration: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_incident: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description_sinistre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type_sinistre: { // Ex: 'Collision', 'Incendie', 'Vol', 'Maladie'
    type: DataTypes.STRING(100),
    allowNull: true
  },
  statut_sinistre: { // Ex: 'Déclaré', 'En expertise', 'Approuvé', 'Refusé', 'Clos'
    type: DataTypes.STRING(50),
    defaultValue: 'Déclaré'
  },
  reference_sinistre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  date_resolution: { // Date de résolution/clôture du sinistre
    type: DataTypes.DATEONLY,
    allowNull: true // Null tant que le sinistre n'est pas clos
  },
  montant_estime: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  montant_regle: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'Sinistres',
  timestamps: true,
  underscored: true,
    hooks: {
    afterCreate: async (sinistre, options) => {
      // Supposons que vous ayez accès à l'utilisateur qui effectue l'action à partir des options ou d'un contexte
      const userId = options.userId || null; // Obtenir l'ID de l'utilisateur à partir de la transaction/du contexte

      await HistoriqueEvent.create({
        type_evenement: 'Création Sinistre',
        description: `Sinistre', de référence ${sinistre.numero_sinistre} créé.`,
        entite_affectee: 'Sinistre',
        id_entite_affectee: sinistre.id_sinistre,
        valeurs_apres: sinistre.toJSON(), // Enregistrer toutes les nouvelles valeurs
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterUpdate: async (sinistre, options) => {
      const changedFields = sinistre.changed();
      if (!changedFields || changedFields.length === 0) return; // Aucune modification à enregistrer

      const userId = options.userId || null;

      const previousData = sinistre._previousDataValues;
      const currentData = sinistre.toJSON();

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
        type_evenement: 'Modification Sinistre',
        description: `Sinistre', de référence ${sinistre.numero_sinistre} modifié. ${description_changes}`,
        entite_affectee: 'Sinistre',
        id_entite_affectee: sinistre.id_sinistre,
        valeurs_avant: valeurs_avant,
        valeurs_apres: valeurs_apres,
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterDestroy: async (sinistre, options) => {
      const userId = options.userId || null;

      await HistoriqueEvent.create({
        type_evenement: 'Suppression Sinistre',
        description: `Sinistre', de référence ${sinistre.numero_sinistre} supprimé.`,
        entite_affectee: 'Sinistre',
        id_entite_affectee: sinistre.id_sinistre,
        valeurs_avant: sinistre.toJSON(), // Enregistrer ce qui a été supprimé
        utilisateur_id: userId
      }, { transaction: options.transaction });
    }
  }
});

export default Sinistre;
