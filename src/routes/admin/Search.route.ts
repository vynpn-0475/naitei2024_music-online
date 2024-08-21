import { search } from '@src/controllers/admin/Search.controller';
import { Router } from 'express';

const router = Router();

router.get('/:type?', search);

export default router;
