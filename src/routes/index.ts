import { index } from '@src/controller/index.controller';
import { Router } from 'express';

const router = Router();

router.get('/', index);

export default router;
