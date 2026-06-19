import { protect } from '../../../middleware/auth/auth.js';
import { authorize } from '../../../middleware/auth/rbacAuthorize.js';

/** DB may store teacher; API role for mentors is mentor. */
export const mentorAuth = [protect, authorize('mentor', 'teacher')];

export function registerUploadErrorHandler(router) {
  router.use((err, req, res, next) => {
    if (err?.name === 'MulterError' || /file|upload/i.test(String(err?.message ?? ''))) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
      });
    }
    return next(err);
  });
}
