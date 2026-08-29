import { Router } from 'express';
import { getAgentStatus, analyzeTransaction, executeRecovery } from '../controllers/agentController';
const router = Router();
router.get('/status', getAgentStatus);
router.post('/analyze', analyzeTransaction);
router.post('/recover', executeRecovery);
export default router;
