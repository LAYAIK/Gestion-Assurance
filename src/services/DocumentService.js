// src/services/documentService.js
import Document from '../models/DocumentModel.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Pour générer des noms de fichiers uniques

class DocumentService {

  /**
   * Télécharge un fichier, enregistre ses métadonnées dans la base de données,
   * et le lie à une entité (dossier, contrat, etc.).
   * @param {object} file - L'objet fichier (provenant de Multer, par exemple).
   * @param {string} entite_liee - Le type d'entité liée ('dossier', 'contrat', 'sinistre').
   * @param {string} id_entite_liee - L'ID de l'entité liée.
   * @param {string} description - Description optionnelle du document.
   * @returns {Promise<Document>} Le document créé.
   * @throws {Error} Si une erreur survient lors du téléchargement ou de l'enregistrement.
   */
  static async uploaderDocument(file, entite_liee, id_entite_liee, description = null) {
    // 1. Validation de l'entité liée
    const allowedEntities = ['dossier', 'contrat', 'sinistre'];
    if (!allowedEntities.includes(entite_liee)) {
      throw new Error(`Type d'entité liée non autorisé: ${entite_liee}.  Doit être l'un des suivants: ${allowedEntities.join(', ')}`);
    }

    // 2. Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join('uploads', uniqueFilename); // 'uploads' doit exister

    // 3. Déplacer le fichier vers le répertoire de stockage
    try {
      fs.renameSync(file.path, filePath); // `file.path` est le chemin temporaire de Multer
    } catch (error) {
      console.error('Erreur lors du déplacement du fichier:', error);
      throw new Error('Erreur lors de l\'enregistrement du fichier.');
    }

    // 4. Enregistrer les métadonnées dans la base de données
    try {
      const document = await Document.create({
        nom_fichier: file.originalname,
        chemin_fichier: filePath, // Ou un URL si vous utilisez S3
        type_mime: file.mimetype,
        taille_fichier: file.size,
        entite_liee,
        id_entite_liee,
        description,
      });
      return document;
    } catch (error) {
      // En cas d'erreur avec la base de données, supprimer le fichier téléchargé
      fs.unlinkSync(filePath);
      throw error; // Relancer l'erreur pour que le contrôleur la gère
    }
  }

  /**
   * Récupère tous les documents liés à une entité (dossier, contrat, sinistre).
   * @param {string} entite_liee - Le type d'entité liée ('dossier', 'contrat', 'sinistre').
   * @param {string} id_entite_liee - L'ID de l'entité liée.
   * @returns {Promise<Document[]>} Un tableau de documents.
   */
  static async getDocumentsByEntity(entite_liee, id_entite_liee) {
    return await Document.findAll({
      where: { entite_liee, id_entite_liee },
    });
  }

  /**
   * Récupère un document par son ID.
   * @param {string} id_document - L'ID du document.
   * @returns {Promise<Document>} Le document trouvé.
   * @throws {Error} Si le document n'est pas trouvé.
   */
  static async getDocumentById(id_document) {
    const document = await Document.findByPk(id_document);
    if (!document) {
      throw new Error('Document non trouvé');
    }
    return document;
  }

  /**
   * Supprime un document (et le fichier associé).
   * @param {string} id_document - L'ID du document à supprimer.
   * @returns {Promise<void>}
   * @throws {Error} Si le document n'est pas trouvé ou si une erreur survient lors de la suppression.
   */
  static async supprimerDocument(id_document) {
    const document = await Document.findByPk(id_document);
    if (!document) {
      throw new Error('Document non trouvé');
    }

    try {
      // 1. Supprimer l'entrée de la base de données
      await document.destroy();

      // 2. Supprimer le fichier associé
      fs.unlinkSync(document.chemin_fichier);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw new Error('Erreur lors de la suppression du document.');
    }
  }
}

export default DocumentService;