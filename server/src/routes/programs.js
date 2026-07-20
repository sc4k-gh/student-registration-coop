import express from 'express';
import { list } from '../controllers/programController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(list));

export default router;
