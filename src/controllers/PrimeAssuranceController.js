// src/controllers/primeAssuranceController.js
import PrimeAssurance from '../models/PrimeAssuranceModel.js';
import ContratAssurance from '../models/ContratAssuranceModel.js';
import { sequelize } from '../models/index.js';

export const genererAvisEcheance = async (req, res) => {
  const { id_contrat } = req.params;
  try {
    const contrat = await ContratAssurance.findByPk(id_contrat);
    if (!contrat) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    // Logique pour calculer la date d'échéance et le montant (à adapter à votre logique métier)
    const date_echeance = new Date(); // Exemple : date du jour
    date_echeance.setMonth(date_echeance.getMonth() + 1); // Prochaine échéance : dans un mois
    const montant = contrat.montant_prime; // Exemple : utiliser un champ du contrat

    const prime = await PrimeAssurance.create({
      id_contrat: contrat.id_contrat,
      montant,
      date_echeance,
      statut: 'En attente'
    });

    res.status(201).json(prime);
  } catch (error) {
    console.error("Erreur lors de la génération de l'avis d'échéance:", error);
    res.status(500).json({ message: "Erreur lors de la génération de l'avis d'échéance", error: error.message });
  }
};

// Autres actions : marquer comme payée, suivi des impayés, etc.
export const marquerPrimePayee = async (req, res) => {
  const { id_prime } = req.params;
  const { date_paiement, mode_paiement, reference_paiement } = req.body;
  try {
    const prime = await PrimeAssurance.findByPk(id_prime);
    if (!prime) {
      return res.status(404).json({ message: 'Prime non trouvée' });
    }

    prime.date_paiement = date_paiement;
    prime.mode_paiement = mode_paiement;
    prime.reference_paiement = reference_paiement;
    prime.statut = 'Payée';
    await prime.save();

    res.status(200).json(prime);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la prime:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la prime", error: error.message });
  }
};

export const getPrimesPourContrat = async (req, res) => {
    const { id_contrat } = req.params;
    try {
      const primes = await PrimeAssurance.findAll({
        where: { id_contrat },
        order: [['date_echeance', 'ASC']]
      });
      res.status(200).json(primes);
    } catch (error) {
      console.error("Erreur lors de la récupération des primes:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des primes", error: error.message });
    }
  };