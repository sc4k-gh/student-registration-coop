import express from 'express';
import { signup, login, setupPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.post('/setup-password', requireAuth, asyncHandler(setupPassword));

export default router;
