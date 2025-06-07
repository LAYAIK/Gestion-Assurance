// src/models/CompagnieModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Compagnie = sequelize.define('Compagnie', {
  id_compagnie: { // Utilisation d'un UUID pour l'ID primaire, si vous souhaitez int, faites-le moi savoir
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom_compagnie: { // Renommé de 'nomCompagnie' pour le snake_case et lisibilité
    type: DataTypes.STRING(255), // char dans le diagramme, STRING est plus flexible
    allowNull: false
  }
}, {
  tableName: 'Compagnies',
  timestamps: true, // Ajoute createdAt et updatedAt
  underscored: true // Utilise snake_case pour les noms de colonnes
});

export default Compagnie;
