import { Router } from 'express';
import genreRoutes from './Genre.route';

const router = Router();

router.use('/genres', genreRoutes);
router.use('/', genreRoutes);

export default router;
