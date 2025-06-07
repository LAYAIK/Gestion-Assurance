import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import express from 'express';
import 'dotenv/config'; // Charge les variables d'environnement depuis le fichier .env

const app = express();
const PORT = process.env.PORT || 3000;  


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Authentification Assurance',
      version: '1.0.0',
      description: 'La documentation de l\'API d\'authentification pour l\'application d\'assurance',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/`,
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // Paths to files containing API docs (JSDoc comments)
};

const specs = swaggerJSDoc(options);

// --- Swagger UI Setup ---
export default (app) => {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));    
}


