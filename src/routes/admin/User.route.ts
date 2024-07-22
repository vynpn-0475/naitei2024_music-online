import { UserController } from '@src/controllers/user/user.controller';
import { CreateUserDto } from '@src/DTO/user/createUser';
import validateRequest from '@src/middleware/validate-request.middleware';
import { Router } from 'express';

const router = Router();

router.get('/', UserController.getList);
router.get('/create', UserController.getCreate);
router.post(
  '/create',
  validateRequest(CreateUserDto),
  UserController.postCreate
);

export default router;
