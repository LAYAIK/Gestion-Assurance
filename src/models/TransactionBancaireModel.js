// src/models/TransactionBancaireModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TransactionBancaire = sequelize.define('TransactionBancaire', {
  id_transaction: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  date_transaction: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: { // Débit ou Crédit
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rapprochement_id: { // Pour lier à une Prime ou Indemnisation
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'Transactions_Bancaires',
  timestamps: true,
  underscored: true
});

export default TransactionBancaire;