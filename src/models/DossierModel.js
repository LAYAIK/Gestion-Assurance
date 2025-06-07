// src/models/DossierModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js'; // Relation avec ContratAss
import EtatDossier from './EtatDossierModel.js'; // Relation avec EtatDoss
import Sinistre from './SinistreModel.js'; // Relation avec Sinistre
import Archive from './ArchiveModel.js'; // Relation avec Archive (si un dossier est archivé)

const Dossier = sequelize.define('Dossier', {
  id_dossier: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  // Ajout de champs descriptifs pour un dossier
  numero_dossier: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  date_creation: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'Dossiers',
  timestamps: true,
  underscored: true
});

export default Dossier;
