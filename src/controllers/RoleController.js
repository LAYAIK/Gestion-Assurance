import Role from "../models/RoleModel.js";



const getRole = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (error) {
        console.error('Erreur lors de la recherche des rôles:', error);
        res.status(500).json({ message: 'Une erreur s\'est produite lors de la recherche des rôles.' });
    }
};

const postRole = async(req, res) => {
    try {
        const {nom_role, description } = req.body;
        const role = await Role.findOne({where: {nom_role}});
        if (role) {
            return res.status(400).json({ message: 'Le rôles existe deja' });
        }
        const newRole = await Role.create({
            nom_role,
            description
        });
        res.status(201).json(newRole);
    } catch (error) {
        console.error('Erreur lors de la création du rôles:', error);
        res.status(500).json({ message: 'Une erreur s\'est produite lors de la création du rôles.' });
    }
};

const putRole = async(req, res) => {
    const {id_role, nom_role, description} = req.params;
    const role = await Role.findByPk(id_role);
    if(role){
        return res.status(400).json({ message: 'Le rôles existe deja' });
    }
    const updateRole = await Role.update({
        nom_role,
        description
    }, {
        where: {
            id_role
        }
    });
    res.status(200).json(updateRole);
};

export {
    getRole,
    postRole,
    putRole
}