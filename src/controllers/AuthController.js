import Utilisateur from "../models/UtilisateurModel.js";
import generateToken from "../controllers/GenerateTokenController.js"; // Assurez-vous que le fichier GenerateTokenController.js";
import bcrypt from "bcrypt";


// controlleur d'authentification de utilisateur
async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis' });
        }
         let emailTrimmed = email.trim().toLowerCase();
        const user = await Utilisateur.findOne({ where: { email : emailTrimmed } });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        if( !user.is_actif && user.date_demande === null) {
            return res.status(403).json({ message: 'Compte inactif, veuillez faire une demande auprés de l\'administrateur' });
        }
        if (!user.is_actif && user.date_demande !== null) {
            return res.status(403).json({ message: 'Compte inactif, veuillez attendre la validation de l\'administrateur' });
        }
        const token = generateToken(user.id_utilisateur, user.id_role);
        res.json({ 
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id_utilisateur,
                email: user.adresse_email,
                nom: user.noms,
                prenom: user.prenoms,
                matricule: user.matricule,
                role: user.role
            }
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
    
};
        
export default loginController;
