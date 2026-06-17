import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, '../../uploads/profiles');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const PROFILE_PICTURE_MAX_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = String(req.params.userId ?? 'unknown');
    const dir = path.join(UPLOAD_ROOT, userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().slice(0, 8);
    const safeExt = /^\.(jpe?g|png|webp)$/.test(ext) ? ext : '.jpg';
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `avatar-${token}${safeExt}`);
  },
});

export const profilePictureUpload = multer({
  storage,
  limits: { fileSize: PROFILE_PICTURE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  },
});

export function profilePictureUploadDir(userId) {
  return path.join(UPLOAD_ROOT, String(userId));
}
