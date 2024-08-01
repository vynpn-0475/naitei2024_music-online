import { UserController } from '@src/controllers/user.controller';
import { Router } from 'express';
import validateRequest from '@src/middleware/validate-request.middleware';
import { RegisterDto } from '@src/DTO/user/register';
import { index } from '@src/controllers/index.controller';

const router = Router();

router.get('/', index);
router.get('/register', UserController.getRegister);
router.post('/check-username', UserController.checkUsername);
router.post(
  '/register',
  validateRequest(RegisterDto),
  UserController.postRegister
);
router.get('/login', UserController.getLogin);
router.post('/login', UserController.postLogin);
router.get('/logout', UserController.logout);

router.get('/error', (req, res) => {
  res.render('error', { title: req.t('error.title') });
});
export default router;
