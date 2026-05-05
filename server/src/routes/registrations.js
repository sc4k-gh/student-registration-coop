import express from 'express';
import { listMine, create } from '../controllers/registrationController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(requireAuth, requireRole('parent'));

router.get('/my', listMine);
router.post('/', create);

export default router;
