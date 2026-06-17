import { Router } from 'express';
import { mentorAuth } from './shared.js';
import * as skillsController from '../../../controllers/mentorSystem/mentorSkillsController.js';

const router = Router();

router.get('/mentors/:userId/skills', skillsController.listMentorSkills);
router.post('/mentors/:userId/skills', ...mentorAuth, skillsController.addMentorSkill);
router.delete('/mentors/:userId/skills/:subSkillId', ...mentorAuth, skillsController.deleteMentorSkill);

export default router;
