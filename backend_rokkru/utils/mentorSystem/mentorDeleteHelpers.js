import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  MentorPortfolio,
  MentorSkill,
  MentorPost,
  MentorExperience,
} from '../../models/index.js';
import { portfolioUploadDir } from '../../middleware/mentorSystem/portfolioUpload.js';
import {
  getAttachmentsFromItem,
  deletePortfolioFilesForItem,
} from './portfolioHelpers.js';

const LEGACY_PROFILE_UPLOAD_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads/profiles'
);

async function removeUploadDir(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    /* ignore missing dir */
  }
}

/** Delete related mentor rows and uploaded files before removing mentor profile. */
export async function deleteMentorRelatedData(userId, mentor) {
  const portfolioItems = await MentorPortfolio.findAll({ where: { mentor_id: userId } });
  for (const item of portfolioItems) {
    const files = getAttachmentsFromItem(item);
    await deletePortfolioFilesForItem(userId, item.link, files);
  }
  await MentorPortfolio.destroy({ where: { mentor_id: userId } });
  await removeUploadDir(portfolioUploadDir(userId));

  await MentorSkill.destroy({ where: { user_id: userId } });
  await MentorPost.destroy({ where: { user_id: userId } });
  await MentorExperience.destroy({ where: { mentor_id: userId } });

  // Legacy local profile uploads (avatars now use Cloudinary via /users/me/profile-picture).
  if (mentor?.profile_picture && /\/profile-pictures\//i.test(String(mentor.profile_picture))) {
    await removeUploadDir(path.join(LEGACY_PROFILE_UPLOAD_ROOT, String(userId)));
  }
}
