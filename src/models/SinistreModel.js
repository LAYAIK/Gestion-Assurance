// src/models/SinistreModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js'; // Relation avec ContratAss
import Utilisateur from './UtilisateurModel.js'; // L'utilisateur qui gère le sinistre

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
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type_sinistre: { // Ex: 'Collision', 'Incendie', 'Vol', 'Maladie'
    type: DataTypes.STRING(100),
    allowNull: true
  },
  statut: { // Ex: 'Déclaré', 'En expertise', 'Approuvé', 'Refusé', 'Clos'
    type: DataTypes.STRING(50),
    defaultValue: 'Déclaré'
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
  underscored: true
});

export default Sinistre;
