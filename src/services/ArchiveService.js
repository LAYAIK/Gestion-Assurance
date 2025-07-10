// src/services/archiveDossierService.js
import Archive from '../models/ArchiveModel.js';
import Dossier from '../models/DossierModel.js'; // Assurez-vous que le chemin est correct
import { sequelize } from '../models/index.js';

class ArchiveService {

  /**
   * Archive un dossier.  Récupère le contenu actuel du dossier, le sauvegarde
   * dans l'archive, et supprime le dossier original.
   * @param {string} id_dossier - L'ID du dossier à archiver.
   * @param {string} raison_archivage - La raison de l'archivage.
   * @returns {Promise<Archive>} L'archive créée.
   * @throws {Error} Si le dossier n'est pas trouvé.
   */
  static async archiver(id_dossier, raison_archivage) {
    const t = await sequelize.transaction();
    try {
      const dossier = await Dossier.findByPk(id_dossier, { transaction: t });
      if (!dossier) {
        throw new Error('Dossier non trouvé');
      }

      const contenu_dossier = dossier.toJSON(); // Snapshot du dossier

      const archive = await Archive.create({
        id_dossier: dossier.id_dossier,
        raison_archivage,
        contenu_dossier
      }, { transaction: t });

      await dossier.destroy({ transaction: t }); // Supprimer le dossier original

      await t.commit();
      return archive;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Récupère toutes les archives de dossiers.
   * @returns {Promise<Archive[]>} Un tableau d'archives.
   */
  static async getArchives() {
    return await Archive.findAll();
  }

  /**
   * Récupère une archive de dossier par son ID.
   * @param {string} id_archive - L'ID de l'archive.
   * @returns {Promise<Archive>} L'archive trouvée.
   * @throws {Error} Si l'archive n'est pas trouvée.
   */
  static async getArchiveById(id_archive) {
    const archive = await Archive.findByPk(id_archive);
    if (!archive) {
      throw new Error('Archive non trouvée');
    }
    return archive;
  }
}

export default ArchiveService;