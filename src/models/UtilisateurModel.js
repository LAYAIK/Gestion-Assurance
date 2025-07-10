// src/models/UtilisateurModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Role from './RoleModel.js'; // Assurez-vous que le modèle Role est importé correctement
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     Utilisateur:
 *       type: object
 *       properties:
 *         id_utilisateur:
 *           type: string
 *           format: uuid
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         fonction:
 *           type: string
 *         direction:
 *           type: string
 *         is_actif:
 *           type: boolean
 *         id_role:
 *           type: string
 *           format: uuid
 */

const Utilisateur = sequelize.define('Utilisateur', {
  id_utilisateur: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // 
    primaryKey: true,
    allowNull: false
  },
  nom: { // Renommé de 'nom' pour lisibilité, char dans le diagramme
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prenom: { // Renommé de 'prenom' pour lisibilité, char dans le diagramme
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: { // Ajout de l'email pour l'authentification
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: { // Champ pour le mot de passe haché
    type: DataTypes.STRING,
    allowNull: true
  },
  fonction: { // Champ pour la fonction de l'utilisateur
    type: DataTypes.STRING(100),
    allowNull: true
  },
  direction: { // Champ pour la direction de l'utilisateur
    type: DataTypes.STRING(100),
    allowNull: true
  },
  justificatif: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_actif: { // Champ pour l'état actif de l'utilisateur
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Par défaut, l'utilisateur n'est pas actif
    allowNull: false
  },
  date_demande: { // Champ pour la date de demande d'activation
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Utilisateurs',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (utilisateur) => {
      if (utilisateur.password) {
        const salt = await bcrypt.genSalt(10);
        utilisateur.password = await bcrypt.hash(utilisateur.password, salt);
      }
    },
    beforeUpdate: async (utilisateur) => {
      if (utilisateur.changed('password') && utilisateur.password) {
        const salt = await bcrypt.genSalt(10);
        utilisateur.password = await bcrypt.hash(utilisateur.password, salt);
      }
    }
  }
});

//Méthode d'instance pour comparer les mots de passe
// Utilisateur.prototype.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

export default Utilisateur;
