import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as postsController from '../../../controllers/mentorSystem/mentorPostsController.js';

const router = Router();

router.get('/mentors/:userId/posts', postsController.listPost);
router.post('/mentors/:userId/posts', ...mentorAuth, postsController.createPost);

export default router;
