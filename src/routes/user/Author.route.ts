import { detail } from '@src/controllers/user/Author.user.controller';
import { Router } from 'express';

const router = Router();

router.get('/:id', detail);

export default router;
