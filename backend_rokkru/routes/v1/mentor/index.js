import { Router } from 'express';
import staticRoutes from './static.routes.js';
import profileRoutes from './profile.routes.js';
import skillsRoutes from './skills.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import experienceRoutes from './experience.routes.js';
import postsRoutes from './posts.routes.js';
import { registerUploadErrorHandler } from './shared.js';

const router = Router();

router.use(staticRoutes);
router.use(profileRoutes);
router.use(skillsRoutes);
router.use(portfolioRoutes);
router.use(experienceRoutes);
router.use(postsRoutes);

registerUploadErrorHandler(router);

export default router;
