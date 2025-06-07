import Utilisateur from '../models/UtilisateurModel.js';



const askController = async (req, res) => {
    try {

    const { email, fonction, direction, justificatif } = req.body;
    if (!email || !fonction || !direction || !justificatif) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    let emailTrimmed = email.trim().toLowerCase();
    const existingUser = await Utilisateur.findOne({ where: { email : emailTrimmed } });
    if (!existingUser) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (existingUser.is_actif) {
        return res.status(404).json({ message: "L\'Utilisateur existe deja et possède un compte actif veuillez vous connecter" });
    }
    const updatedRows = await Utilisateur.update(
        { fonction, direction, justificatif}, // Mettre à jour 
        { where: { email : emailTrimmed } }
    );
    if (updatedRows === 0) {
        return res.status(400).json({ message: "Aucune mise à jour effectuée" });
    }
    const updatedUser = await Utilisateur.findOne({ where: { email : emailTrimmed } });
    res.status(201).json({ message: 'Demande envoyée', user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande' });

    }

};
export default askController;