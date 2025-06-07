// src/models/HistoriqueEventModel.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ContratAssurance from './ContratAssuranceModel.js'; // Relation avec ContratAss
import Dossier from './DossierModel.js'; // Relation avec Dossier (si un événement est lié à un dossier)
import Sinistre from './SinistreModel.js'; // Relation avec Sinistre (si un événement est lié à un sinistre)
import Utilisateur from './UtilisateurModel.js'; // L'utilisateur qui a enregistré l'événement

const HistoriqueEvent = sequelize.define('HistoriqueEvent', {
  id_hist_event: { // Utilisation d'un UUID pour l'ID primaire
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  type_evenement: { // Ex: 'Statut changé', 'Document ajouté', 'Commentaire', 'Paiement enregistré'
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date_evenement: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'Historique_Evenements',
  timestamps: true, // Ajoute createdAt et updatedAt
  underscored: true
});

export default HistoriqueEvent;
