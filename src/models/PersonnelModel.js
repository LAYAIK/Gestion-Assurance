// src/models/PersonnelModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Utilisateur from './UtilisateurModel.js'; // Pour la relation avec Utilisateur
import Compagnie from './CompagnieModel.js'; // Pour la relation avec Compagnie

const Personnel = sequelize.define('Personnel', {
  id_personnel: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  // Le diagramme ne montre que 'idPersonnel', mais un personnel doit avoir d'autres infos
  // Ajout de champs communs pour un personnel
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true, // Peut être null si le personnel n'a pas d'email
    unique: true, // Un personnel peut avoir un email unique
    validate: {
      isEmail: true // Validation de l'email
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true // Peut être null si le personnel n'a pas de téléphone
  },
  poste: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'Personnels',
  timestamps: true,
  underscored: true
});

export default Personnel;
