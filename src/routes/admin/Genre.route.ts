import {
  detail,
  list,
  validateAndFetchGenre,
} from '@src/controllers/admin/Genre.controller';
import { Router } from 'express';

const router = Router();

router.get('/', list);
router.get('/:id', validateAndFetchGenre, detail);

export default router;
