// ============= Start mentor bundle controller (page-level GET payloads) =============
import {
  Mentor,
  MentorPortfolio,
  MentorSkill,
  MentorPost,
  MentorExperience,
  Skill,
  SubSkill,
  Province,
} from '../../models/index.js';
import { SKILL_ATTRS, SUB_SKILL_ATTRS } from '../../utils/mentorSystem/skillDisplayName.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';
import { getAuthUserId } from '../../utils/mentorSystem/getAuthUserId.js';
import { serializePortfolioItem } from '../../utils/mentorSystem/portfolioHelpers.js';
import { buildMyAnalyticsPayload } from '../../utils/mentorSystem/mentorAnalyticsPayload.js';

const skillCatalogInclude = [{
  model: SubSkill,
  attributes: SUB_SKILL_ATTRS,
  order: [['sub_skill_name', 'ASC']],
}];

const mentorSkillInclude = [
  { model: Skill, attributes: SKILL_ATTRS },
  {
    model: SubSkill,
    attributes: SUB_SKILL_ATTRS,
    include: [{ model: Skill, attributes: SKILL_ATTRS }],
  },
];

const postInclude = [
  { model: SubSkill, include: [{ model: Skill }] },
  { model: Province },
];

async function loadSkillsCatalog() {
  const rows = await Skill.findAll({
    attributes: SKILL_ATTRS,
    include: skillCatalogInclude,
    order: [['skill_name', 'ASC']],
  });
  return rows.map((row) => row.get({ plain: true }));
}

async function loadProvinces() {
  const rows = await Province.findAll({ order: [['province_name', 'ASC']] });
  return rows.map((row) => row.get({ plain: true }));
}

/** GET /mentors/catalog — skills + provinces for filters and onboarding */
const getCatalog = async (req, res) => {
  try {
    const [skills, provinces] = await Promise.all([loadSkillsCatalog(), loadProvinces()]);
    return ok(res, { skills, provinces });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** GET /mentors/me/dashboard — analytics + posts + mentor row */
const getMyDashboard = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (userId === null) return fail(res, 'Unauthorized', 401);

    const [mentor, analytics, posts] = await Promise.all([
      Mentor.findByPk(userId),
      buildMyAnalyticsPayload(userId),
      MentorPost.findAll({
        where: { user_id: userId },
        include: postInclude,
        order: [['create_date', 'DESC']],
      }),
    ]);

    if (!mentor) return fail(res, 'Mentor profile not found', 404);

    return ok(res, {
      mentor: mentor.get({ plain: true }),
      analytics,
      posts: posts.map((row) => row.get({ plain: true })),
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** GET /mentors/me/edit-profile — profile page bundle */
const getMyEditProfile = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (userId === null) return fail(res, 'Unauthorized', 401);

    const [mentor, portfolioRows, experienceRows, mentorSkills, skills, provinces] =
      await Promise.all([
        Mentor.findByPk(userId, {
          include: [{ model: Province, attributes: ['province_id', 'province_name', 'province_name_kh'] }],
        }),
        MentorPortfolio.findAll({
          where: { user_id: userId },
          order: [
            ['sort_order', 'ASC'],
            ['link', 'ASC'],
          ],
        }),
        MentorExperience.findAll({
          where: { user_id: userId },
          order: [['mentor_experience_id', 'ASC']],
        }),
        MentorSkill.findAll({
          where: { user_id: userId },
          include: mentorSkillInclude,
          order: [['ms_id', 'ASC']],
        }),
        loadSkillsCatalog(),
        loadProvinces(),
      ]);

    const portfolio = portfolioRows.map((row) => serializePortfolioItem(row, req));

    return ok(res, {
      profile: mentor ? mentor.get({ plain: true }) : null,
      portfolio,
      experience: experienceRows.map((row) => row.get({ plain: true })),
      mentorSkills: mentorSkills.map((row) => row.get({ plain: true })),
      catalog: { skills, provinces },
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export { getCatalog, getMyDashboard, getMyEditProfile };
// ============= End mentor bundle controller =============
