import { Router } from 'express';
import genreRoutes from './Genre.route';
import userRoutes from './User.route';
const router = Router();

router.use('/genres', genreRoutes);
router.use('/users', userRoutes);
router.use('/', genreRoutes);

export default router;
