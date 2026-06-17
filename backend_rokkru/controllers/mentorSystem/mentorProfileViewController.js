// ============= Start mentor profile view controller =============
import jwt from 'jsonwebtoken';
import { Mentor } from '../../models/index.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';

async function resolveOptionalViewerId(req) {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = Number(decoded?.user_id);
    return Number.isNaN(id) ? null : id;
  } catch {
    return null;
  }
}

/** POST /v1/mentors/:userId/profile-views — increment mentor.profile_view_count */
const recordProfileView = async (req, res) => {
  try {
    const mentorId = Number(req.params.userId);
    if (!mentorId || Number.isNaN(mentorId)) {
      return fail(res, 'Invalid mentor id', 400);
    }

    const mentor = await Mentor.findByPk(mentorId);
    if (!mentor) return fail(res, 'Mentor not found', 404);

    const viewerId = await resolveOptionalViewerId(req);
    if (viewerId != null && viewerId === mentorId) {
      return ok(res, {
        recorded: false,
        reason: 'self_view',
        profile_view_count: mentor.profile_view_count ?? 0,
      });
    }

    await mentor.increment('profile_view_count', { by: 1 });
    await mentor.reload();

    return ok(res, {
      recorded: true,
      profile_view_count: mentor.profile_view_count ?? 0,
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export { recordProfileView };
// ============= End mentor profile view controller =============
