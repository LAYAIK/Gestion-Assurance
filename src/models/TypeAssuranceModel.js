// src/models/TypeAssModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TypeAssurance = sequelize.define('TypeAssurance', {
  id_type_assurance: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom: { // Type d'assurance (ex: 'Auto', 'Habitation', 'Santé')
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'Types_Assurance',
  timestamps: true,
  underscored: true
});

export default TypeAssurance;
