import { search } from '@src/controllers/user/Search.controller';
import { Router } from 'express';

const router = Router();

router.get('/:type?', search);

export default router;
