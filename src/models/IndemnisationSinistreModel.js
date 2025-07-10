// src/models/IndemnisationSinistreModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Sinistre from './SinistreModel.js';

const IndemnisationSinistre = sequelize.define('IndemnisationSinistre', {
  id_indemnisation: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date_paiement: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  mode_paiement: { // Virement, Chèque
    type: DataTypes.STRING(50),
    allowNull: true
  },
  statut: { // En attente, Validée, Payée
    type: DataTypes.STRING(50),
    defaultValue: 'En attente',
    allowNull: false
  },
  reference_paiement: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description_indemnisation: { // Nouveau champ pour la description de la proposition
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Indemnisations_Sinistre',
  timestamps: true,
  underscored: true
});

export default IndemnisationSinistre;