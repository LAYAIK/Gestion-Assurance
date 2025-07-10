// src/models/DocumentModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
// Importations des modèles liés
import ContratAssurance from './ContratAssuranceModel.js'; // Renommé 'Policy' pour correspondre à ContratAss
import Sinistre from './SinistreModel.js'; // Renommé 'Claim' pour correspondre à Sinistre
import Utilisateur from './UtilisateurModel.js';
import Client from './ClientModel.js'; // Nouvelle importation pour le client
import Dossier from './DossierModel.js'; // Importer Dossier pour la liaison

const Document = sequelize.define('Document', {
  id_document: { // Renommé id_piece_jointe à id_document pour consistance
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom_fichier: { // Renommé description en nom_fichier
    type: DataTypes.STRING(255),
    allowNull: false
  },
  chemin_fichier: { // Chemin où le document est stocké (ex: sur le système de fichiers, S3)
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type_fichier: { // Ex: 'application/pdf', 'image/jpeg'
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'Documents', // Renommé Pieces_Jointes à Documents pour généraliser
  timestamps: true,
  underscored: true,
  
});

export default Document;
