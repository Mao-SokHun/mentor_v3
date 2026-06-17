import fs from 'fs/promises';
import {
  MentorPortfolio,
  MentorSkill,
  MentorPost,
  MentorExperience,
} from '../../models/index.js';
import { portfolioUploadDir } from '../../middleware/mentorSystem/portfolioUpload.js';
import { profilePictureUploadDir } from '../../middleware/mentorSystem/profilePictureUpload.js';
import {
  getAttachmentsFromItem,
  deletePortfolioFilesForItem,
} from './portfolioHelpers.js';
import { removeStoredProfilePicture } from './profilePictureHelpers.js';

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

  if (mentor?.profile_picture) {
    await removeStoredProfilePicture(userId, mentor.profile_picture);
  }
  await removeUploadDir(profilePictureUploadDir(userId));
}
