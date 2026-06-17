import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as experienceController from '../../../controllers/mentorSystem/mentorExperienceController.js';

const router = Router();

router.get('/mentors/:userId/experience', experienceController.listExperience);
router.post('/mentors/:userId/experience', ...mentorAuth, experienceController.createExperience);
router.patch(
  '/mentors/:userId/experience/:experienceId',
  ...mentorAuth,
  experienceController.updateExperience
);
router.delete(
  '/mentors/:userId/experience/:experienceId',
  ...mentorAuth,
  experienceController.deleteExperience
);

export default router;
