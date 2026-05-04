import express from 'express';
import { listAvailable } from '../controllers/timeSlotController.js';

const router = express.Router();

router.get('/', listAvailable);

export default router;
