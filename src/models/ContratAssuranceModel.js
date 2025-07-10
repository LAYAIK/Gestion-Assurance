// src/models/ContratAssModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Client from './ClientModel.js';
import TypeAssurance from './TypeAssuranceModel.js';
import Compagnie from './CompagnieModel.js';
import Utilisateur from './UtilisateurModel.js'; // L'utilisateur qui a créé/géré le contrat
import Vehicule from './VehiculeModel.js';
import HistoriqueEvent from './HistoriqueEventModel.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     ContratAssurance:
 *       type: object
 *       properties:
 *         id_police:
 *           type: string
 *           format: uuid
 *         numero_contrat:
 *           type: string
 *         date_debut:
 *           type: string
 *           format: date
 *         date_fin:
 *           type: string
 *           format: date
 *         montant_prime:
 *           type: number
 *         statut_contrat:
 *           type: string
 *         id_client:
 *           type: string
 *           format: uuid
 *         id_type_assurance:
 *           type: string
 *           format: uuid
 *         id_compagnie:
 *           type: string
 *           format: uuid
 *         id_utilisateur_gestionnaire:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

const ContratAssurance = sequelize.define('ContratAssurance', {
  id_police: { // Correspond à idPolice (PK) dans le diagramme
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  id_contrat: { // Correspond à idContrat (PK) dans le diagramme
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  numero_contrat: { // Numéro unique du contrat (ex: "POLICE-2024-0001")
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  date_debut: {
    type: DataTypes.DATEONLY, // Date au format YYYY-MM-DD
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATEONLY, // Date au format YYYY-MM-DD
    allowNull: false
  },
  montant_prime: { // Montant de la prime d'assurance
    type: DataTypes.DECIMAL(10, 2), // Ex: 1234.56
    allowNull: false
  },
  statut_contrat: { // Statut du contrat: 'Actif', 'Expiré', 'Annulé', 'En attente', 'Renouvelé'
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Actif',
    validate: {
      isIn: [['Actif', 'Expiré', 'Annulé', 'En attente', 'Renouvelé']]
    }
  }
}, {
  tableName: 'Contrats_Assurance',
  timestamps: true,
  underscored: true,
  hooks: {
    afterCreate: async (contrat, options) => {
      // Supposons que vous ayez accès à l'utilisateur qui effectue l'action à partir des options ou d'un contexte
      const userId = options.userId || null; // Obtenir l'ID de l'utilisateur à partir de la transaction/du contexte

      await HistoriqueEvent.create({
        type_evenement: 'Création Contrat',
        description: `Contrat de référence ${contrat.numero_contrat} créé.`,
        entite_affectee: 'ContratAssurance',
        id_entite_affectee: contrat.id_police,
        valeurs_apres: contrat.toJSON(), // Enregistrer toutes les nouvelles valeurs
        utilisateur_id: userId
      }, { transaction: options.transaction }); // Utiliser la transaction si elle existe
    },
    afterUpdate: async (contrat, options) => {
      const changedFields = contrat.changed();
      if (!changedFields || changedFields.length === 0) return; // Aucune modification à enregistrer

      const userId = options.userId || null;

      const previousData = contrat._previousDataValues;
      const currentData = contrat.toJSON();

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
        type_evenement: 'Modification Contrat',
        description: `Contrat de référence ${contrat.numero_contrat} modifié. ${description_changes}`,
        entite_affectee: 'ContratAssurance',
        id_entite_affectee: contrat.id_police,
        valeurs_avant: valeurs_avant,
        valeurs_apres: valeurs_apres,
        utilisateur_id: userId
      }, { transaction: options.transaction });
    },
    afterDestroy: async (contrat, options) => {
      const userId = options.userId || null;

      await HistoriqueEvent.create({
        type_evenement: 'Suppression Contrat',
        description: `Contrat de référence ${contrat.numero_contrat} supprimé.`,
        entite_affectee: 'ContratAssurance',
        id_entite_affectee: contrat.id_police,
        valeurs_avant: contrat.toJSON(), // Enregistrer ce qui a été supprimé
        utilisateur_id: userId
      }, { transaction: options.transaction });
    }
  }
});

export default ContratAssurance;
