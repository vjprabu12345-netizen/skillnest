import express from 'express';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
  checkFavourite,
} from '../controllers/favouriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getFavourites);
router.post('/:resourceId', addFavourite);
router.delete('/:resourceId', removeFavourite);
router.get('/check/:resourceId', checkFavourite);

export default router;
