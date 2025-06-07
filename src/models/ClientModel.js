// src/models/ClientModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Client = sequelize.define('Client', {
  id_client: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom: { // Ajout d'un nom pour le client
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telephone: {
    type: DataTypes.STRING(20)
  },
  carte_identite: { // Champ pour la carte d'identité ou CIN
    type: DataTypes.STRING(50),
    allowNull: true // Peut être null si le client ne fournit pas de CIN
  },
  adresse: {
    type: DataTypes.STRING(255)
  }
  // Vous pouvez ajouter d'autres attributs ici comme date de naissance, CIN, etc.
}, {
  tableName: 'Clients',
  timestamps: true,
  underscored: true
});

export default Client;
