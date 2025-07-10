// src/middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';

// Configuration de Multer pour le stockage sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads'); // 'uploads' doit exister
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Multer ne doit PAS générer de noms de fichiers uniques.  Le service le fera.
    cb(null, file.originalname); // Conserver le nom original pour le moment.
  },
});

// Filtre pour accepter certains types de fichiers (optionnel)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']; // etc.
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite la taille des fichiers à 10MB
  },
});

export default upload;