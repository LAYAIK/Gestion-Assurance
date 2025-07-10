// src/controllers/documentController.js
import DocumentService from '../services/DocumentService.js';
import upload from '../middlewares/UploadMiddleware.js';

export const uploaderDocument = async (req, res) => {
  // `upload.single('fichier')` est le nom du champ dans le formulaire
  upload.single('fichier')(req, res, async (err) => { // Utiliser un middleware pour gérer le téléchargement
    if (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      return res.status(400).json({ message: err.message }); // Gérer les erreurs de Multer
    }

    const { entite_liee, id_entite_liee, description } = req.body;
    try {
      const document = await DocumentService.uploaderDocument(req.file, entite_liee, id_entite_liee, description);
      res.status(201).json(document);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du document:', error);
      res.status(500).json({ message: error.message });
    }
  });
};

export const getDocumentsByEntity = async (req, res) => {
  const { entite_liee, id_entite_liee } = req.params;
  try {
    const documents = await DocumentService.getDocumentsByEntity(entite_liee, id_entite_liee);
    res.status(200).json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  const { id_document } = req.params;
  try {
    const document = await DocumentService.getDocumentById(id_document);
    res.status(200).json(document);
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    res.status(error.message === 'Document non trouvé' ? 404 : 500).json({ message: error.message });
  }
};

export const supprimerDocument = async (req, res) => {
  const { id_document } = req.params;
  try {
    await DocumentService.supprimerDocument(id_document);
    res.status(204).send(); // 204 No Content pour une suppression réussie
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: error.message });
  }
};