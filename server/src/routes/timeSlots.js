import express from 'express';
import { listAvailable } from '../controllers/timeSlotController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(listAvailable));

export default router;
