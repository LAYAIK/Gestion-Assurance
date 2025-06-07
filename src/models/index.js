// src/models/index.js
import { sequelize } from '../config/db.js';

// Importation de tous les modèles
import Compagnie from './CompagnieModel.js';
import Utilisateur from './UtilisateurModel.js';
import TypeAssurance from './TypeAssuranceModel.js';
import Personnel from './PersonnelModel.js';
import Client from './ClientModel.js';
import ContratAssurance from './ContratAssuranceModel.js';
import Vehicule from './VehiculeModel.js';
import HistoriqueEvent from './HistoriqueEventModel.js';
import Dossier from './DossierModel.js';
import EtatDossier from './EtatDossierModel.js';
import Sinistre from './SinistreModel.js';
import Archive from './ArchiveModel.js';
import Role from './RoleModel.js';

// --- Définition des Associations ---

// Compagnie - Utilisateur (1..*)
// Une compagnie peut avoir plusieurs utilisateurs
Compagnie.hasMany(Utilisateur, { foreignKey: 'id_compagnie', as: 'utilisateurs' });
Utilisateur.belongsTo(Compagnie, { foreignKey: 'id_compagnie', as: 'compagnie' });

// Compagnie - Personnel (1..*)
// Une compagnie peut avoir plusieurs personnels
Compagnie.hasMany(Personnel, { foreignKey: 'id_compagnie', as: 'personnels' });
Personnel.belongsTo(Compagnie, { foreignKey: 'id_compagnie', as: 'compagnie' });

// Utilisateur - Personnel (0..1)
// Un utilisateur peut être un personnel, et un personnel peut être un utilisateur
Utilisateur.hasOne(Personnel, { foreignKey: 'id_utilisateur', as: 'profil_personnel' });
Personnel.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur', as: 'compte_utilisateur' });

// Client - ContratAss (1..*)
// Un client peut avoir plusieurs contrats d'assurance
Client.hasMany(ContratAssurance, { foreignKey: 'id_client', as: 'contrats_assurance' });
ContratAssurance.belongsTo(Client, { foreignKey: 'id_client', as: 'client' });

// TypeAss - ContratAss (1..*)
// Un type d'assurance peut être lié à plusieurs contrats
TypeAssurance.hasMany(ContratAssurance, { foreignKey: 'id_type_assurance', as: 'contrats_assurance' });
ContratAssurance.belongsTo(TypeAssurance, { foreignKey: 'id_type_assurance', as: 'type_assurance' });

// Compagnie - ContratAss (1..*)
// Une compagnie peut émettre plusieurs contrats
Compagnie.hasMany(ContratAssurance, { foreignKey: 'id_compagnie', as: 'contrats_emis' });
ContratAssurance.belongsTo(Compagnie, { foreignKey: 'id_compagnie', as: 'compagnie_emettrie' });

// Utilisateur - ContratAss (0..*)
// Un utilisateur peut gérer plusieurs contrats
Utilisateur.hasMany(ContratAssurance, { foreignKey: 'id_utilisateur', as: 'contrats_geres' });
ContratAssurance.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur', as: 'gestionnaire_contrat' });

// ContratAss - Vehicule (1..1 ou 0..1)
// Un contrat d'assurance peut couvrir un véhicule, et un véhicule peut être couvert par un contrat
// J'ai mis id_police dans Véhicule comme allowNull: true, car un véhicule peut ne pas avoir de contrat.
// Si un véhicule est toujours lié à un contrat spécifique (One-to-One), cela pourrait être :
// ContratAss.hasOne(Vehicule, { foreignKey: 'id_police', as: 'vehicule_assure' });
// Vehicule.belongsTo(ContratAss, { foreignKey: 'id_police', as: 'contrat_associe' });
// Ici, je garde la relation dans Vehicule, car c'est 0..1 sur le diagramme
ContratAssurance.hasMany(Vehicule, { foreignKey: 'id_police', as: 'vehicules_couverts' });
Vehicule.belongsTo(ContratAssurance, { foreignKey: 'id_police', as: 'contrat_associe' });


// ContratAss - Dossier (1..1)
// Un contrat a un dossier (principale)
ContratAssurance.hasOne(Dossier, { foreignKey: 'id_police', as: 'dossier_associe' });
Dossier.belongsTo(ContratAssurance, { foreignKey: 'id_police', as: 'contrat_principal' });

// Dossier - EtatDoss (1..1)
// Un dossier a un seul état
EtatDossier.hasMany(Dossier, { foreignKey: 'id_etat_dossier', as: 'dossiers_avec_cet_etat' });
Dossier.belongsTo(EtatDossier, { foreignKey: 'id_etat_dossier', as: 'etat_actuel' });

// Dossier - Sinistre (0..*)
// Un dossier peut avoir plusieurs sinistres
Dossier.hasMany(Sinistre, { foreignKey: 'id_dossier', as: 'sinistres_lies' });
Sinistre.belongsTo(Dossier, { foreignKey: 'id_dossier', as: 'dossier_parent' });

// ContratAss - Sinistre (1..*)
// Un contrat peut avoir plusieurs sinistres
ContratAssurance.hasMany(Sinistre, { foreignKey: 'id_police', as: 'sinistres_sur_contrat' });
Sinistre.belongsTo(ContratAssurance, { foreignKey: 'id_police', as: 'contrat_sinistre' });

// Utilisateur - Sinistre (0..*)
// Un utilisateur peut gérer plusieurs sinistres
Utilisateur.hasMany(Sinistre, { foreignKey: 'id_utilisateur', as: 'sinistres_geres' });
Sinistre.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur', as: 'gestionnaire_sinistre' });

// Dossier - Archive (0..1)
// Un dossier peut être archivé une seule fois
Archive.hasMany(Dossier, { foreignKey: 'id_archive', as: 'dossiers_archives' });
Dossier.belongsTo(Archive, { foreignKey: 'id_archive', as: 'archive_liee' });

// HistoriqueEvent - ContratAss (0..*)
// Un événement peut être lié à un contrat
ContratAssurance.hasMany(HistoriqueEvent, { foreignKey: 'id_police', as: 'historique_contrat' });
HistoriqueEvent.belongsTo(ContratAssurance, { foreignKey: 'id_police', as: 'contrat_concerne' });

// HistoriqueEvent - Dossier (0..*)
// Un événement peut être lié à un dossier
Dossier.hasMany(HistoriqueEvent, { foreignKey: 'id_dossier', as: 'historique_dossier' });
HistoriqueEvent.belongsTo(Dossier, { foreignKey: 'id_dossier', as: 'dossier_concerne' });

// HistoriqueEvent - Sinistre (0..*)
// Un événement peut être lié à un sinistre
Sinistre.hasMany(HistoriqueEvent, { foreignKey: 'id_sinistre', as: 'historique_sinistre' });
HistoriqueEvent.belongsTo(Sinistre, { foreignKey: 'id_sinistre', as: 'sinistre_concerne' });

// HistoriqueEvent - Utilisateur (0..*)
// Un utilisateur peut enregistrer plusieurs événements
Utilisateur.hasMany(HistoriqueEvent, { foreignKey: 'id_utilisateur', as: 'evenements_enregistres' });
HistoriqueEvent.belongsTo(Utilisateur, { foreignKey: 'id_utilisateur', as: 'enregistre_par' });

// Utilisateur - Role (1..1)
Role.hasMany(Utilisateur, { foreignKey: 'id_role', as: 'utilisateurs' });
Utilisateur.belongsTo(Role, { foreignKey: 'id_role', as: 'role_utilisateur' });


// Exportation de l'instance sequelize et de tous les modèles
export {
  sequelize,
  Compagnie,
  Utilisateur,
  TypeAssurance,
  Personnel,
  Client,
  ContratAssurance,
  Vehicule,
  HistoriqueEvent,
  Dossier,
  EtatDossier,
  Sinistre,
  Archive,
  Role
};
