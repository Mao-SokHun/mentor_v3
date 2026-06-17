// ============= Start mentor analytics controller =============
import { Mentor } from '../../models/index.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';
import { getAuthUserId } from '../../utils/mentorSystem/getAuthUserId.js';
import { buildMyAnalyticsPayload } from '../../utils/mentorSystem/mentorAnalyticsPayload.js';

const getMyAnalytics = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (userId === null) return fail(res, 'Unauthorized', 401);

    const mentor = await Mentor.findByPk(userId);
    if (!mentor) return fail(res, 'Mentor profile not found', 404);

    const analytics = await buildMyAnalyticsPayload(userId);
    return ok(res, analytics);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export { getMyAnalytics };
// ============= End mentor analytics controller =============
