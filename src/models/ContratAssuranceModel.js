// src/models/ContratAssModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Client from './ClientModel.js';
import TypeAssurance from './TypeAssuranceModel.js';
import Compagnie from './CompagnieModel.js';
import Utilisateur from './UtilisateurModel.js'; // L'utilisateur qui a créé/géré le contrat

const Contrats_Assurance = sequelize.define('ContratAssurance', {
  id_police: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  numero_contrat: { // Ajout d'un numéro de contrat unique
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  montant_prime: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  statut: { // Ex: 'Actif', 'Expiré', 'Annulé'
    type: DataTypes.STRING(50),
    defaultValue: 'Actif'
  }
}, {
  tableName: 'Contrats_Assurance',
  timestamps: true,
  underscored: true
});

export default Contrats_Assurance;
