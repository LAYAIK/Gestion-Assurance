import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import express from 'express';
import 'dotenv/config'; // Charge les variables d'environnement depuis le fichier .env
import TypeAssurance from './src/models/TypeAssuranceModel.js';
import ContratAssurance from './src/models/ContratAssuranceModel.js';
import HistoriqueEvent from './src/models/HistoriqueEventModel.js';
import Archive from './src/models/ArchiveModel.js';
import Compagnie from './src/models/CompagnieModel.js';
import EtatDossier from './src/models/EtatDossierModel.js';
import Sinistre from './src/models/SinistreModel.js';
import Dossier from './src/models/DossierModel.js';
import Vehicule from './src/models/VehiculeModel.js';
import Client from './src/models/ClientModel.js';
import Personnel from './src/models/PersonnelModel.js';
import Utilisateur from './src/models/UtilisateurModel.js';
import Role from './src/models/RoleModel.js';
import Document from './src/models/DocumentModel.js';
import IndemnisationSinistre from './src/models/IndemnisationSinistreModel.js';
import { Transaction } from 'sequelize';

const app = express();
const PORT = process.env.PORT || 5000;  


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestion des dossiers d\'Assurance',
      version: '1.0.0',
      description: 'La documentation de l\'API d\'authentification pour l\'application d\'assurance',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Authentification JWT (Exemple: "Bearer VOTRE_TOKEN")'
        },
      },
      schemas: {
        // ... (vos schémas existants : Utilisateur, LoginRequest, RegisterRequest, Client, Historique, Document)

        // NOUVEAU SCHÉMA POUR TYPEASS
        TypeAssurance: {
          type: 'object',
          properties: {
            id_type_assurance: { type: 'string', format: 'uuid', description: 'UUID du type d\'assurance' },
            nom: { type: 'string', description: 'Nom du type d\'assurance (ex: Auto, Santé)' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['nom'],
          example: {
            id_type_ass: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            nom: "Assurance Auto"
          }
        },

        Archive: {
          type: 'object',
          properties: {
            id_archive: { type: 'string', format: 'uuid', description: 'UUID de l\'archive' },
            date_archivage: { type: 'string', format: 'date-time', description: 'Date de l\'archivage' },
            raison_archivage: { type: 'string', nullable: true, description: 'Raison de l\'archivage' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['date_archivage'],
          example: {
            id_archive: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            date_archivage: "2022-12-31T23:59:59.999Z",
            raison_archivage: "Raison de l'archivage"
          }
        },

        Compagnie: {
          type: 'object',
          properties: {
            id_compagnie: { type: 'string', format: 'uuid', description: 'UUID de la compagnie' },
            nom_compagnie: { type: 'string', description: 'Nom de la compagnie' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['nom_compagnie'],
          example: {
            id_compagnie: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            nom_compagnie: "Nom de la compagnie"
          }
        },

        Document: {
          type: 'object',
          properties: {
            id_document: { type: 'string', format: 'uuid', description: 'UUID du document' },
            nom_document: { type: 'string', description: 'Nom du document' },
            type_document: { type: 'string', description: 'Type de document' },
            chemin_document: { type: 'string', description: 'Chemin du document' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['nom_document'],
          example: {
            id_document: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            nom_document: "Nom du document"
          }
        },

        EtatDossier: {
          type: 'object',
          properties: {
            id_etat_dossier: { type: 'string', format: 'uuid', description: 'UUID de l\'etat du dossier' },
            nom_etat: { type: 'string', description: 'Nom de l\'etat du dossier' },
            description: { type: 'string', nullable: true, description: 'Description de l\'etat du dossier' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['nom_etat'],
          example: {
            id_etat_dossier: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            nom_etat: "Nom de l'etat du dossier"
          }
        },
        IndemnisationSinistre: {
          type: 'object',
          properties: {
            id_indemnisation: { type: 'string', format: 'uuid', description: 'UUID de l\'indemnisation du sinistre' },
            date_paiement: { type: 'string', format: 'date-time', description: 'Date de l\'indemnisation du sinistre' },
            montant_paiement: { type: 'number', description: 'Montant de l\'indemnisation du sinistre' },
            mode_paiement: { type: 'string', description: 'Mode de paiement de l\'indemnisation du sinistre' },
            status: { type: 'string', description: 'Statut de l\'indemnisation du sinistre' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        Personnel: {
          type: 'object',
          properties: {
            id_personnel: { type: 'string', format: 'uuid', description: 'UUID du personnel' },
            nom: { type: 'string', description: 'Nom du personnel' },
            prenom: { type: 'string', description: 'Prénom du personnel' },
            email: { type: 'string', description: 'Adresse email du personnel' },
            numero_identite: { type: 'string', description: 'Numéro d\'identité du personnel' },
            telephone: { type: 'string', description: 'Numéro de telephone du personnel' },
            poste: { type: 'string', description: 'Poste du personnel' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['nom_personnel', 'prenom_personnel'],
          example: {
            id_personnel: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            nom: "Nom du personnel",
            prenom: "Prénom du personnel",
            email: "Adresse email du personnel",
            numero_identite: "Numéro d'identité du personnel",
          }
        },
        PrimeAssurance: {
          type: 'object',
          properties: {
            id_prime: { type: 'string', format: 'uuid', description: 'UUID de la prime d\'assurance' },
            date_paiement: { type: 'string', format: 'date-time', description: 'Date de la prime d\'assurance' },
            montant: { type: 'number', description: 'Montant de la prime d\'assurance' },
            date_echeance: { type: 'string', format: 'date-time', description: 'Date d\'echeance de la prime d\'assurance' },
            mode_paiement: { type: 'string', description: 'Mode de paiement de la prime d\'assurance' },
            reference_paiement: { type: 'string', description: 'Reference de paiement de la prime d\'assurance' },
            status: { type: 'string', description: 'Statut de la prime d\'assurance' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['date_paiement', 'montant'],
          example: {
            id_prime: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            date_paiement: "2023-01-01",
            montant: 10000.00,
            date_echeance: "2023-02-01",
            mode_paiement: "Cheque",
            reference_paiement: "123456789",
            status: "En cours",
            created_at: "2023-01-01T00:00:00.000Z",
            updated_at: "2023-01-01T00:00:00.000Z"
          }
        },
        TransactionBancaire: {
          type: 'object',
          properties: {
            id_transaction: { type: 'string', format: 'uuid', description: 'UUID de la transaction bancaire' },
            date_transaction: { type: 'string', format: 'date-time', description: 'Date de la transaction bancaire' },
            montant: { type: 'number', description: 'Montant de la transaction bancaire' },
            description: { type: 'string', description: 'Description de la transaction bancaire' },
            reference: { type: 'string', description: 'Reference de la transaction bancaire' },
            type: { type: 'string', description: 'Type de la transaction bancaire' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['date_transaction', 'montant'],
          example: {
            id_transaction: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            date_transaction: "2023-01-01",
            montant: 10000.00,
            description: "Paiement de la prime d'assurance",
            reference: "123456789",
            type: "Paiement",
            created_at: "2023-01-01T00:00:00.000Z",
            updated_at: "2023-01-01T00:00:00.000Z"
          }
        },

         Vehicule: {
          type: 'object',
          properties: {
            immatriculation: { type: 'string', description: 'Numéro d\'immatriculation unique du véhicule (PK)' },
            marque: { type: 'string', description: 'Marque du véhicule' },
            modele: { type: 'string', description: 'Modèle du véhicule' },
            annee_fabrication: { type: 'integer', description: 'Année de fabrication du véhicule', format: 'int32' },
            numero_chassis: { type: 'string', nullable: true, description: 'Numéro de châssis (VIN) du véhicule (unique)' },
            couleur: { type: 'string', nullable: true, description: 'Couleur du véhicule' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['immatriculation', 'marque', 'modele', 'id_police'],
          example: {
            immatriculation: "AZ-123-BY",
            marque: "Toyota",
            modele: "Corolla",
            annee_fabrication: 2021,
            numero_chassis: "XYZABC1234567890",
            couleur: "Gris",
          }
        },

                // NOUVEAU SCHÉMA POUR DOSSIER
        Dossier: {
          type: 'object',
          properties: {
            id_dossier: { type: 'string', format: 'uuid', description: 'UUID du dossier' },
            numero_dossier: { type: 'string', description: 'Numéro unique du dossier' },
            titre: { type: 'string', nullable: true, description: 'Titre ou sujet du dossier' },
            description: { type: 'string', nullable: true, description: 'Description détaillée du dossier' },
            date_creation: { type: 'string', format: 'date', description: 'Date de création du dossier' },
            id_contrat: { type: 'string', format: 'uuid', description: 'ID du contrat d\'assurance associé' },
            id_etat_dos: { type: 'string', format: 'uuid', description: 'ID de l\'état actuel du dossier' },
            id_archive: { type: 'string', format: 'uuid', nullable: true, description: 'ID de l\'archive associée (si archivé)' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['numero_dossier', 'id_contrat', 'id_etat_dos'],
          example: {
            id_dossier: "g1h2i3j4-k5l6-7890-1234-567890abcdef",
            numero_dossier: "DOSS-2024-001",
            titre: "Sinistre Véhicule Dupont",
            description: "Dossier créé suite à la déclaration du sinistre auto de Mr. Dupont.",
            date_creation: "2024-07-10",
            id_contrat: "d1e2f3a4-b5c6-7890-1234-567890abcdef",
            id_etat_dos: "f1e2d3c4-a5b6-7890-1234-567890abcdef",
            id_archive: null
          }
        },

                // NOUVEAU SCHÉMA POUR SINISTRE
        Sinistre: {
          type: 'object',
          properties: {
            id_sinistre: { type: 'string', format: 'uuid', description: 'UUID du sinistre' },
            numero_sinistre: { type: 'string', description: 'Numéro unique du sinistre' },
            date_declaration: { type: 'string', format: 'date', description: 'Date de déclaration du sinistre' },
            date_incident: { type: 'string', format: 'date', description: 'Date de l\'incident' },
            description: { type: 'string', description: 'Description détaillée du sinistre' },
            type_sinistre: { type: 'string', nullable: true, description: 'Type du sinistre (ex: Collision, Incendie)' },
            statut: { type: 'string', enum: ['Déclaré', 'En expertise', 'Approuvé', 'Refusé', 'Clos'], description: 'Statut actuel du sinistre' },
            montant_estime: { type: 'number', format: 'float', nullable: true, description: 'Montant estimé du dommage' },
            montant_regle: { type: 'number', format: 'float', nullable: true, description: 'Montant réglé' },
            date_resolution: { type: 'string', format: 'date', nullable: true, description: 'Date de résolution du sinistre' },
            id_dossier: { type: 'string', format: 'uuid', description: 'ID du dossier associé' },
            id_police: { type: 'string', format: 'uuid', description: 'ID du contrat d\'assurance lié' },
            id_utilisateur_gestionnaire: { type: 'string', format: 'uuid', nullable: true, description: 'ID de l\'utilisateur gestionnaire/expert' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['numero_sinistre', 'date_incident', 'description', 'id_dossier', 'id_police'],
          example: {
            id_sinistre: "h1i2j3k4-l5m6-7890-1234-567890abcdef",
            numero_sinistre: "SIN-2024-002",
            date_declaration: "2024-07-11",
            date_incident: "2024-07-10",
            description: "Accident de voiture mineur avec dommages matériels.",
            type_sinistre: "Collision",
            statut: "Déclaré",
            montant_estime: 1500.00,
            montant_regle: null,
            date_resolution: null,
            id_dossier: "g1h2i3j4-k5l6-7890-1234-567890abcdef",
            id_police: "d1e2f3a4-b5c6-7890-1234-567890abcdef",
            id_utilisateur_gestionnaire: null
          }
        },

        HistoriqueEvent: {
          type: 'object',
          properties: {
            id_hist_event: { type: 'string', format: 'uuid', description: 'UUID de l\'historique' },
            type_evenement: { type: 'string', description: 'Type d\'evenement' },
            description: { type: 'string', description: 'Description de l\'evenement' },
            entite_affectee: { type: 'string', description: 'Entite affectee' },
            id_entite_affectee: { type: 'string', format: 'uuid', description: 'ID de l\'entite affectee' },
            valeurs_avant: { type: 'object', description: 'Valeurs avant l\'evenement' },
            valeurs_apres: { type: 'object', description: 'Valeurs apres l\'evenement' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['type_evenement', 'description', 'entite_affectee', 'id_entite_affectee'],
          example: {
            id_hist_event: "h1i2j3k4-l5m6-7890-1234-567890abcdef",
            type_evenement: "Statut changé",
            description: "Le statut du sinistre a changé de 'Déclaré' à 'En expertise'.",
            entite_affectee: "Sinistre",
            id_entite_affectee: "d1e2f3a4-b5c6-7890-1234-567890abcdef",
            valeurs_avant: {
              statut: "Déclaré"
            },
            valeurs_apres: {
              statut: "En expertise"
            }
          }
        }
      }
    },
      security: [{
      bearerAuth: []
    }]


  },
  apis: ['./src/routes/*.js', './src/models/*.js','./src/controllers/*.js' ], // Paths to files containing API docs (JSDoc comments)
};

const specs = swaggerJSDoc(options);

// --- Swagger UI Setup ---
export default (app) => {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));    
}


