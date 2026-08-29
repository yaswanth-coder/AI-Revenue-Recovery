import { Router } from 'express';
import { runSimulation } from '../controllers/simulatorController';
const router = Router();
router.post('/run', runSimulation);
export default router;
