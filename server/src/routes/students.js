import express from 'express';
import { create } from '../controllers/studentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(requireAuth, requireRole('parent'));

router.post('/', create);

export default router;
