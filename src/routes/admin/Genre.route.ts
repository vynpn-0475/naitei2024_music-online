import { list } from '@src/controllers/admin/Genre.controller';
import { Router } from 'express';

const router = Router();

router.get('/', list);

export default router;
