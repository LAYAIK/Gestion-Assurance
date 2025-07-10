// src/models/PrimeAssuranceModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js';

const PrimeAssurance = sequelize.define('PrimeAssurance', {
  id_prime: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date_echeance: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_paiement: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  mode_paiement: { // Virement, Prélèvement, Carte
    type: DataTypes.STRING(50),
    allowNull: true
  },
  statut: { // En attente, Payée, Impayée
    type: DataTypes.STRING(50),
    defaultValue: 'En attente',
    allowNull: false
  },
  reference_paiement: { // Numéro de transaction, etc.
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Primes_Assurance',
  timestamps: true,
  underscored: true
});


export default PrimeAssurance;