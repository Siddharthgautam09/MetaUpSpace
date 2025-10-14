import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/users - get all active users
router.get('/', authenticate, getAllUsers);

export default router;
