import express from 'express';
import { getPublicStats } from '../controllers/statController.js';

const router = express.Router();

router.get('/summary', getPublicStats);

export default router;
