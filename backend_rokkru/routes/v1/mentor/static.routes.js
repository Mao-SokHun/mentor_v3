import { Router } from 'express';
import * as portfolioController from '../../../controllers/mentorSystem/mentorPortfolioController.js';
import * as mentorController from '../../../controllers/mentorSystem/mentorController.js';
import * as skillsController from '../../../controllers/mentorSystem/mentorSkillsController.js';
import * as provinceController from '../../../controllers/mentorSystem/provinceController.js';
import * as postsController from '../../../controllers/mentorSystem/mentorPostsController.js';
import * as profileViewController from '../../../controllers/mentorSystem/mentorProfileViewController.js';
import * as bundleController from '../../../controllers/mentorSystem/mentorBundleController.js';

const router = Router();

router.get('/portfolio-files/:mentorId/:filename', portfolioController.servePortfolioFile);
router.get('/profile-pictures/:userId/:filename', mentorController.serveProfilePicture);

router.get('/mentors/catalog', bundleController.getCatalog);
router.get('/mentors', mentorController.listMentors);
router.get('/mentors/search', mentorController.searchMentors);

router.get('/mentors/skill/listAllSkill', skillsController.listSkill);
router.get('/mentors/provinces/listAll', provinceController.listAllProvinces);

router.get('/mentors/posts', postsController.listPublishedPosts);
router.get('/mentors/posts/:postId', postsController.getPostById);
router.get('/mentors/posts/:postId/legacy', postsController.getPostByIdLegacy);

router.post('/mentors/:userId/profile-views', profileViewController.recordProfileView);

export default router;
