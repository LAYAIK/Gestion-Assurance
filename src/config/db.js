// src/config/db.js
import dotenv from "dotenv";
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres', // Assurez-vous que c'est 'postgres'
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connecté à PostgreSQL avec succès !');
  } catch (error) {
    console.error('Erreur de connexion à PostgreSQL:', error.message);
    process.exit(1);
  }
};

export default { sequelize, connectDB };
export { sequelize, connectDB }; // Exporter les deux éléments pour une utilisation dans d'autres fichiers
