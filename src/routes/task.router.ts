import { parseUser } from '../controllers/shared.controller';
import { getTasks } from '../controllers/task.controller';
import { Router } from 'express';

const router = Router();

router.get('/', parseUser, getTasks)

export default router;