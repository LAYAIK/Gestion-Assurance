import {sequelize, connectDB } from "./src/config/db.js"; // Import the connectDB function
import app from "./app.js"; // Import the Express app
import 'dotenv/config'; // Load environment variables from .env file
import * as models from "./src/models/index.js"; // Import all models


const PORT = process.env.PORT || 3000; // Set the port from environment variables or default to 3000

// Connect to the database
async function runApp() {
  await connectDB();

    try {
        await sequelize.sync({ force: false }); // Utilisez force: false pour ne pas supprimer les données existantes
        console.log("Modèles synchronisés avec la base de données.");

            // Optionnel: Créer un utilisateur admin si la base est vide
    // const adminExists = await models.Utilisateur.findOne({ where: { nom_role: 'admin' } });
    // if (!adminExists) {
    //     console.log("Création d'un utilisateur admin par défaut...");
    //     await models.Utilisateur.create({
    //         nom: 'Admin Principal',
    //         email: 'admin@example.com',
    //         mot_de_passe: 'password123', // !!! Changez ceci en production !!!
    //         role: 'admin'
    //     });
    //     console.log("Utilisateur admin créé (admin@example.com / password123)");
    // }

    } catch (error) {
        console.error("Erreur lors de la synchronisation des modèles ou des opérations:", error);
    }

    app.listen(PORT, () => {
        console.log(`Le serveur est démarré sur le port ${PORT}`);
    });
}

runApp(); // Call the function to run the app



