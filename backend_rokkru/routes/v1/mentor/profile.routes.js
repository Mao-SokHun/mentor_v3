import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as mentorController from '../../../controllers/mentorSystem/mentorController.js';
import * as analyticsController from '../../../controllers/mentorSystem/mentorAnalyticsController.js';
import * as postsController from '../../../controllers/mentorSystem/mentorPostsController.js';
import * as bundleController from '../../../controllers/mentorSystem/mentorBundleController.js';
import { profilePictureUpload } from '../../../middleware/mentorSystem/profilePictureUpload.js';

const router = Router();

router.get('/mentors/me', ...mentorAuth, mentorController.getMyMentor);
router.get('/mentors/me/analytics', ...mentorAuth, analyticsController.getMyAnalytics);
router.get('/mentors/me/dashboard', ...mentorAuth, bundleController.getMyDashboard);
router.get('/mentors/me/edit-profile', ...mentorAuth, bundleController.getMyEditProfile);
router.get('/mentors/me/posts', ...mentorAuth, postsController.listMyPosts);

router.post('/mentors', ...mentorAuth, mentorController.createMentor);
router.patch('/mentors/posts/:postId', ...mentorAuth, postsController.updatePost);
router.delete('/mentors/posts/:postId', ...mentorAuth, postsController.deletePost);

router.get('/mentors/:userId', mentorController.getMentorById);
router.put('/mentors/:userId', ...mentorAuth, mentorController.updateMentor);
router.post(
  '/mentors/:userId/profile-picture',
  ...mentorAuth,
  profilePictureUpload.single('file'),
  mentorController.uploadProfilePicture
);
router.delete('/mentors/:userId', ...mentorAuth, mentorController.deleteMentor);

export default router;
