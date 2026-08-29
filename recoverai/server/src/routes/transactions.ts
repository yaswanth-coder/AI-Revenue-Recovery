import { Router } from 'express';
import { getTransactions, getTransactionById, createTransaction } from '../controllers/transactionController';
const router = Router();
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
export default router;
