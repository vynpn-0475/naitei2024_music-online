import { homepage } from '@src/controllers/index.controller';
import { Router } from 'express';
import index from './admin/index';

const router = Router();

router.get('/', homepage);

router.use('/admin', index);

export default router;
