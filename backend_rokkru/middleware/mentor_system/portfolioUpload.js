import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, '../../uploads/portfolio');

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const PORTFOLIO_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const PORTFOLIO_MAX_FILES_PER_ITEM = 5;

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const mentorId = String(req.params.userId ?? 'unknown');
    const dir = path.join(UPLOAD_ROOT, mentorId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().slice(0, 8);
    const safeExt = /^\.(pdf|jpe?g|png|webp)$/.test(ext) ? ext : '';
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${token}${safeExt}`);
  },
});

export const portfolioUpload = multer({
  storage,
  limits: { fileSize: PORTFOLIO_MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF, JPEG, PNG, and WebP files are allowed'));
  },
});

export function portfolioUploadDir(mentorId) {
  return path.join(UPLOAD_ROOT, String(mentorId));
}
