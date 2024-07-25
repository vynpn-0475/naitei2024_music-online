import { Router } from 'express';
import genreRoutes from './Genre.route';
import authorRoutes from './Author.route';

const router = Router();

router.use('/genres', genreRoutes);
router.use('/authors', authorRoutes);
router.use('/', genreRoutes);

export default router;
