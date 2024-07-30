import { UserController } from '@src/controllers/user.controller';
import { CreateUserDto } from '@src/DTO/user/createUser';
import validateRequest from '@src/middleware/validate-request.middleware';
import { Router } from 'express';

const router = Router();
router.get('/', UserController.getList);
router.get('/:id', UserController.getDetail);
router.get('/update/:id', UserController.getUpdatePage);
router.put(
  '/update/:id',
  validateRequest(CreateUserDto),
  UserController.postUpdate
);
router.delete('/delete/:id', UserController.postDelete);
export default router;
