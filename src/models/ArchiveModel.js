// src/models/ArchiveModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Archive = sequelize.define('Archive', {
  id_archive: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  date_archivage: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  raison_archivage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
  // Les dossiers archivés sont liés via la clé étrangère dans DossierModel
}, {
  tableName: 'Archives',
  timestamps: true,
  underscored: true
});

export default Archive;
