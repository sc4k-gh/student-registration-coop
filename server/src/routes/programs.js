import express from 'express';
import { list } from '../controllers/programController.js';

const router = express.Router();

router.get('/', list);

export default router;
