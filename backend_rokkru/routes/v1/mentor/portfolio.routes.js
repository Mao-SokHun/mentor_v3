import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as portfolioController from '../../../controllers/mentorSystem/mentorPortfolioController.js';
import { portfolioUpload } from '../../../middleware/mentorSystem/portfolioUpload.js';

const router = Router();

router.get('/mentors/:userId/portfolio', portfolioController.listPortfolio);
router.post('/mentors/:userId/portfolio', ...mentorAuth, portfolioController.creatPortfolio);
router.post(
  '/mentors/:userId/portfolio/with-file',
  ...mentorAuth,
  portfolioUpload.single('file'),
  portfolioController.createPortfolioWithFile
);
router.patch('/mentors/:userId/portfolio/:link', ...mentorAuth, portfolioController.updatePortfolio);
router.delete('/mentors/:userId/portfolio/:link', ...mentorAuth, portfolioController.deletePortfolio);
router.get('/mentors/:userId/portfolio/:link/files', portfolioController.listPortfolioFiles);
router.post(
  '/mentors/:userId/portfolio/:link/files',
  ...mentorAuth,
  portfolioUpload.single('file'),
  portfolioController.uploadPortfolioFile
);
router.delete(
  '/mentors/:userId/portfolio/:link/files/:fileId',
  ...mentorAuth,
  portfolioController.deletePortfolioFile
);

export default router;
