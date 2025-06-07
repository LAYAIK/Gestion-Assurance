// src/models/EtatDossModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const EtatDossier = sequelize.define('EtatDossier', {
  id_etat_dossier: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom_etat: { // Ex: 'Ouvert', 'En attente', 'Clôturé', 'Refusé'
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Etats_Dossier',
  timestamps: true,
  underscored: true
});

export default EtatDossier;
