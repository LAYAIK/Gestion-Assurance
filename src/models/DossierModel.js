// src/models/DossierModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js'; // Relation avec ContratAss
import EtatDossier from './EtatDossierModel.js'; // Relation avec EtatDoss
import Sinistre from './SinistreModel.js'; // Relation avec Sinistre
import Archive from './ArchiveModel.js'; // Relation avec Archive (si un dossier est archivé)
import Utilisateur from './UtilisateurModel.js'; // L'utilisateur qui a enregistré le dossier
import Client from './ClientModel.js';
import HistoriqueEvent from './HistoriqueEventModel.js';


const Dossier = sequelize.define('Dossier', {
  id_dossier: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  // Ajout de champs descriptifs pour un dossier
  numero_dossier: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  date_creation: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'Dossiers',
  timestamps: true,
  underscored: true,
    hooks: {
    afterCreate: async (dossier, options) => {
      // Supposons que vous ayez accès à l'utilisateur qui effectue l'action à partir des options ou d'un contexte
      const userId = options.userId || null; // Obtenir l'ID de l'utilisateur à partir de la transaction/du contexte

      await HistoriqueEvent.create({
        type_evenement: 'Création Dossier',
        description: `Dossier de référence ${dossier.numero_dossier} créé.`,
        entite_affectee: 'Dossier',
        id_entite_affectee: dossier.id_dossier,
        valeurs_apres: dossier.toJSON(), // Enregistrer toutes les nouvelles valeurs
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterUpdate: async (dossier, options) => {
      const changedFields = dossier.changed();
      if (!changedFields || changedFields.length === 0) return; // Aucune modification à enregistrer

      const userId = options.userId || null;

      const previousData = dossier._previousDataValues;
      const currentData = dossier.toJSON();

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
        type_evenement: 'Modification Dossier',
        description: `Dossier de référence ${dossier.numero_dossier} modifié. ${description_changes}`,
        entite_affectee: 'Dossi',
        id_entite_affectee: dossier.id_dossier,
        valeurs_avant: valeurs_avant,
        valeurs_apres: valeurs_apres,
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterDestroy: async (dossier, options) => {
      const userId = options.userId || null;

      await HistoriqueEvent.create({
        type_evenement: 'Suppression Dossier',
        description: `Dossier de référence ${dossier.numero_dossier} supprimé.`,
        entite_affectee: 'Dossi',
        id_entite_affectee: dossier.id_dossier,
        valeurs_avant: dossier.toJSON(), // Enregistrer ce qui a été supprimé
        utilisateur_id: userId
      }, { transaction: options.transaction });
    }
  }
});

export default Dossier;
