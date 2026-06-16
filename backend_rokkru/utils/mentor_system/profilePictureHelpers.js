import path from 'path';
import fs from 'fs/promises';
import { profilePictureUploadDir } from '../../middleware/mentor_system/profilePictureUpload.js';

export function buildProfilePictureUrl(req, userId, filename) {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const safeName = encodeURIComponent(String(filename ?? ''));
  return `${protocol}://${host}/api/v1/profile-pictures/${userId}/${safeName}`;
}

export function filenameFromProfilePictureUrl(stored) {
  const text = String(stored ?? '').trim();
  if (!text) return null;
  const match = text.match(/\/profile-pictures\/\d+\/([^/?#]+)/i);
  if (!match) return null;
  try {
    return path.basename(decodeURIComponent(match[1]));
  } catch {
    return path.basename(match[1]);
  }
}

export async function removeStoredProfilePicture(userId, storedUrl) {
  const filename = filenameFromProfilePictureUrl(storedUrl);
  if (!filename || !/^[\w.-]+$/.test(filename)) return;
  const filePath = path.join(profilePictureUploadDir(userId), filename);
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore missing file */
  }
}

export function resolveProfilePicturePath(userId, filenameParam) {
  const filename = path.basename(decodeURIComponent(filenameParam ?? ''));
  if (!filename || !/^[\w.-]+$/.test(filename)) {
    return { error: 'Invalid file name' };
  }
  return { filePath: path.join(profilePictureUploadDir(userId), filename) };
}
