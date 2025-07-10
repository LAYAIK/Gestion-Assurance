// src/controllers/analyticsController.js
import AnalyticsService from '../services/AnalyticsService.js';

export const getDashboardOverview = async (req, res) => {
  try {
    const contratStatus = await AnalyticsService.getContratStatusOverview();
    const sinistreStatus = await AnalyticsService.getSinistreStatusOverview();
    const contratTypeDistribution = await AnalyticsService.getContratTypeDistribution();

    // Pour les totaux, utilisez des dates paramétrables ou une période par défaut (ex: le mois en cours)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const totalPrimes = await AnalyticsService.getTotalPrimesCollected(firstDayOfMonth, lastDayOfMonth);
    const totalIndemnisations = await AnalyticsService.getTotalIndemnisationsPaid(firstDayOfMonth, lastDayOfMonth);

    res.status(200).json({
      contratStatus,
      sinistreStatus,
      contratTypeDistribution,
      totalPrimesCurrentMonth: totalPrimes,
      totalIndemnisationsCurrentMonth: totalIndemnisations,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'aperçu du tableau de bord:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données du tableau de bord', error: error.message });
  }
};

export const getNewClientsData = async (req, res) => {
  try {
    const newClients = await AnalyticsService.getNewClientsEvolution();
    res.status(200).json(newClients);
  } catch (error) {
    console.error('Erreur lors de la récupération des données des nouveaux clients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données des nouveaux clients', error: error.message });
  }
};

export const getCostlySinistres = async (req, res) => {
  const { limit } = req.query;
  try {
    const costlySinistres = await AnalyticsService.getTopCostlySinistres(limit ? parseInt(limit) : 5);
    res.status(200).json(costlySinistres);
  } catch (error) {
    console.error('Erreur lors de la récupération des sinistres les plus coûteux:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sinistres les plus coûteux', error: error.message });
  }
};

export const getPrimesAnalyticsByPeriod = async (req, res) => {
  const { startDate, endDate } = req.query; // Dates requises
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Les dates de début et de fin sont requises.' });
  }
  try {
    const primesData = await AnalyticsService.getPrimesByMonth(startDate, endDate);
    res.status(200).json(primesData);
  } catch (error) {
    console.error('Erreur lors de la récupération des primes par période:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des primes par période', error: error.message });
  }
};