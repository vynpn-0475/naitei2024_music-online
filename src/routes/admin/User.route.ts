import { UserController } from '@src/controllers/user/user.controller';
import { Router } from 'express';

const router = Router();

router.get('/', UserController.getList);

export default router;
