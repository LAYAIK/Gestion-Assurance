// src/routes/analyticsRoutes.js
import { Router } from 'express';
import {
  getDashboardOverview,
  getNewClientsData,
  getCostlySinistres,
  getPrimesAnalyticsByPeriod
} from '../controllers/AnalyticsController.js';
import { protect, authorize } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Routes pour les données analytiques (accessibles généralement aux gestionnaires et admins)
router.get('/dashboard/overview', protect, authorize('gestionnaire', 'admin'), getDashboardOverview);
router.get('/dashboard/new-clients', protect, authorize('gestionnaire', 'admin'), getNewClientsData);
router.get('/reports/costly-sinistres', protect, authorize('gestionnaire', 'admin'), getCostlySinistres);
router.get('/reports/primes-by-month', protect, authorize('gestionnaire', 'admin'), getPrimesAnalyticsByPeriod);

const AnalyticsRoute = router;
export default AnalyticsRoute;