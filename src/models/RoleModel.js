// src/models/RoleModel.js (Si les rôles sont dynamiques)
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';


/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id_role:
 *           type: string
 *           format: uuid
 *         nom_role:
 *           type: string
 *         description:
 *           type: string
 */

const Role = sequelize.define('Role', {
  id_role: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  nom_role: { // Ex: 'admin', 'agent', 'expert'
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Roles',
  timestamps: true,
  underscored: true
});

export default Role;
