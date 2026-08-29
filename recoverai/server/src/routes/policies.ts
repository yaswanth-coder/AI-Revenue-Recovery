import { Router } from 'express';
import { getPolicies, updatePolicy, resetPolicies } from '../controllers/policyController';
const router = Router();
router.get('/', getPolicies);
router.put('/reset', resetPolicies);
router.put('/:id', updatePolicy);
export default router;
