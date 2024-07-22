import { Router } from 'express';
import genreRoutes from './Genre.route';
import albumRoutes from './Album.route';

const router = Router();

router.use('/genres', genreRoutes);
router.use('/', genreRoutes);
router.use('/albums', albumRoutes);

export default router;
