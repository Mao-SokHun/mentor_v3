import { Mentor, MentorPortfolio, MentorSkill, MentorPost } from '../../models/index.js';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function emptyDailyDetailViews(days = 7) {
  const since = startOfDay();
  since.setDate(since.getDate() - (days - 1));
  const series = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    series.push({ date: toDateKey(d), count: 0 });
  }
  return series;
}

function emptyHourlyDetailViewsToday() {
  const buckets = [6, 9, 12, 15, 18, 21];
  return buckets.map((hour) => ({ hour, count: 0 }));
}

/** Shared analytics counts for GET /mentors/me/analytics and dashboard bundle */
export async function buildMyAnalyticsPayload(userId) {
  const mentor = await Mentor.findByPk(userId);
  if (!mentor) return null;

  const [portfolioCount, skillsCount, postsCount, publishedPostsCount] = await Promise.all([
    MentorPortfolio.count({ where: { mentor_id: userId } }),
    MentorSkill.count({ where: { user_id: userId } }),
    MentorPost.count({ where: { user_id: userId } }),
    MentorPost.count({ where: { user_id: userId, status: 'published' } }),
  ]);

  const detailViews = Number(mentor.profile_view_count) || 0;

  return {
    user_id: userId,
    portfolio_count: portfolioCount,
    skills_count: skillsCount,
    posts_count: postsCount,
    published_posts_count: publishedPostsCount,
    profile_views: detailViews,
    sessions_count: publishedPostsCount,
    detail_views_daily: emptyDailyDetailViews(7),
    detail_views_hourly_today: emptyHourlyDetailViewsToday(),
    earnings: null,
  };
}
