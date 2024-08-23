import { Router } from 'express';
import search from './Search.route';

const router = Router();

router.use('/search', search);

export default router;
