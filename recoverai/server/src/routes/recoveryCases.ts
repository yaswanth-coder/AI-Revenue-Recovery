import { Router } from 'express';
import { getRecoveryCases } from '../controllers/recoveryController';
const router = Router();
router.get('/', getRecoveryCases);
export default router;
