// src/controllers/rapprochementBancaireController.js
import TransactionBancaire from '../models/TransactionBancaireModel.js';
import PrimeAssurance from '../models/PrimeAssuranceModel.js';
import IndemnisationSinistre from '../models/IndemnisationSinistreModel.js';
import { sequelize } from '../models/index.js';

export const importerTransactions = async (req, res) => {
  const { transactions } = req.body; // Supposons un tableau de transactions

  const t = await sequelize.transaction();
  try {
    await TransactionBancaire.bulkCreate(transactions, { transaction: t });
    await t.commit();
    res.status(201).json({ message: 'Transactions importées avec succès' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de l\'importation des transactions:', error);
    res.status(500).json({ message: 'Erreur lors de l\'importation des transactions', error: error.message });
  }
};

export const rapprocherTransactions = async (req, res) => {
  const { id_transaction, type_entite, id_entite } = req.body; // type_entite: 'prime' ou 'indemnisation'
  const t = await sequelize.transaction();

  try {
    const transaction = await TransactionBancaire.findByPk(id_transaction, { transaction: t });
    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ message: 'Transaction bancaire non trouvée' });
    }

    if (type_entite === 'prime') {
      const prime = await PrimeAssurance.findByPk(id_entite, { transaction: t });
      if (!prime) {
        await t.rollback();
        return res.status(404).json({ message: 'Prime non trouvée' });
      }
      prime.date_paiement = transaction.date_transaction; // Mettre à jour la date de paiement
      prime.mode_paiement = 'Virement'; // Exemple
      prime.reference_paiement = transaction.reference;
      prime.statut = 'Payée';
      await prime.save({ transaction: t });
      transaction.rapprochement_id = prime.id_prime; // Lier la transaction à la prime
      await transaction.save({ transaction: t });


    } else if (type_entite === 'indemnisation') {
      const indemnisation = await IndemnisationSinistre.findByPk(id_entite, { transaction: t });
       if (!indemnisation) {
        await t.rollback();
        return res.status(404).json({ message: 'Indemnisation non trouvée' });
      }
      indemnisation.date_paiement = transaction.date_transaction;
      indemnisation.mode_paiement = 'Virement'; // Exemple
      indemnisation.reference_paiement = transaction.reference;
      indemnisation.statut = 'Payée';
      await indemnisation.save({ transaction: t });

       transaction.rapprochement_id = indemnisation.id_indemnisation; // Lier la transaction à l'indemnisation
      await transaction.save({ transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: 'Transaction rapprochée avec succès' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors du rapprochement de la transaction:', error);
    res.status(500).json({ message: 'Erreur lors du rapprochement de la transaction', error: error.message });
  }
};