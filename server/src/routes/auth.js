import express from 'express';
import { signup, login, setupPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/setup-password', requireAuth, setupPassword);

export default router;
