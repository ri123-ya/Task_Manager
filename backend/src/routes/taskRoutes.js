import { Router } from 'express';
import {
  getTasks,
  addTask,
  deleteTask,
  moveTask,
} from '../controllers/taskController.js';

const router = Router();

router.get('/', getTasks);
router.post('/', addTask);
router.delete('/:columnId/:taskId', deleteTask);
router.post('/move', moveTask);

export default router;
