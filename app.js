import express from 'express'; // Import Express framework
import cors from 'cors'; // Import CORS middleware for handling cross-origin requests
import helmet from 'helmet'; // Import Helmet for securing HTTP headers
import pinoHttp from 'pino-http';
import pino from 'pino';
import bodyParser from 'body-parser';
import swaggerSetup from './swagger.js'; // Import Swagger setup
import ApiRoutes from './src/routes/index.js'; // Import API routes

import dotenv from 'dotenv'; // Import dotenv for environment variable management
dotenv.config(); // Load environment variables from .env file



const app = express(); // création de l'application express
app.use(bodyParser.json()); // pour parser le corps des requêtes JSON

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const logger = pino({ 
    level: process.env.LOG_LEVEL || 'info',  // niveau de log, par défaut 'info'
    transport: {
        target: 'pino-pretty', // pour formater les logs de manière lisible
        options: {
            colorize: true  // pour colorer les logs dans la console
        }
    }
});
app.use(pinoHttp({ logger })); // middleware pour logger les requêtes HTTP

swaggerSetup(app); // Configuration de Swagger pour la documentation de l'API

ApiRoutes(app); // Utilisation des routes API définies dans ApiRoutes

// Middleware pour gérer les routes non trouvées (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack); // Log l'erreur complète sur la console du serveur
  res.status(err.statusCode || 500).json({ // Utilise le statusCode de l'erreur si défini, sinon 500
    message: err.message || 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'production' ? {} : err.message // Envoie moins de détails en production
  });
});


export default app; // Exporter l'application Express pour l'utiliser dans d'autres fichiers

