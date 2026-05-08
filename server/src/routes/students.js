import express from 'express';
import { create } from '../controllers/studentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
const router = express.Router();

// All routes in this file require parent authentication.
router.use(requireAuth, requireRole('parent'));

// Create a new student (PARENT ONLY):
router.post('/', create);

export default router