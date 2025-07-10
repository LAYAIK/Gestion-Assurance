import  Utilisateur  from "../models/UtilisateurModel.js";
import generateToken  from "../controllers/GenerateTokenController.js"; 

async function RegisterUtilisateurController(req, res) {
    const {  email, password, confirme_password, nom, prenom, } = req.body;

    try {
        if (!email || !password || !confirme_password || !nom || !prenom) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires" });
        }
        if (password !== confirme_password) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
        }
        const existingUser = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase()  } });

        if (existingUser) {
            return res.status(400).json({ message: "L'utilisateur existe deja", user: existingUser });
        }

        let nomTrimmed = nom.trim().toUpperCase(); // Supprimer les espaces en debut et fin de la chaine et Convertir le nom en majuscules
        let prenomTrimmed = prenom.trim().toUpperCase(); // Supprimer les espaces et Convertir le prénom en majuscules
        let emailTrimmed = email.trim().toLowerCase(); // Supprimer les espaces en debut et fin de la chaine et Convertir l'email en minuscules
         // Hachage du mot de passe avec le hook Sequelize beforeCreate du modele Utilisateur est déjà géré, donc pas besoin de le faire ici
        try {
            await Utilisateur.create({ email: emailTrimmed, password, nom: nomTrimmed, prenom: prenomTrimmed });
            try {

                const utilisateur = await Utilisateur.findOne({ where: { email: emailTrimmed } });
                //const token = generateToken(utilisateur.id_utilisateur, utilisateur.id_role);
                res.json({message: "Utilisateur enregistré avec succes", user: utilisateur });

            } catch (error) {
                console.error('Erreur lors de la recherche de l\'utilisateur:', error);
                res.status(500).json({ message: 'Erreur serveur lors de la recherche de l\'utilisateur.' });
            }
        } catch (err) {
            res.status(500).json({ message1: "Erreur serveur", error: err.message });
        }
    } catch (error) {
        res.status(500).json({ message2: "Erreur serveur", error: error.message });
        }
  
}

export default RegisterUtilisateurController;