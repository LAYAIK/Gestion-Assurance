// src/models/VehiculeModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js'; // Pour la relation avec ContratAss

const Vehicule = sequelize.define('Vehicule', {
  immatriculation: { // L'immatriculation comme clé primaire si elle est unique
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  marque: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  modele: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  annee_fabrication: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  couleur: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  numero_chassis: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  numero_carte_grise: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'Vehicules',
  timestamps: true,
  underscored: true
});

export default Vehicule;
