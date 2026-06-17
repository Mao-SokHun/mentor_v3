import { Op } from 'sequelize';
import {
  MentorSkill,
  SubSkill,
  Skill,
} from '../../models/index.js';
import { SKILL_ATTRS, SUB_SKILL_ATTRS } from './skillDisplayName.js';

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Build pagination + filters for GET /mentors (list and search share this). */
export function buildMentorListQuery(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  const searchText = String(req.query.q ?? '').trim();
  const skillId = parseOptionalInt(req.query.skillId);
  const subSkillId = parseOptionalInt(req.query.subSkillId);
  const minExperience = parseOptionalInt(req.query.minExperience);

  const where = {};
  if (searchText) {
    where[Op.or] = [
      { firstname: { [Op.iLike]: `%${searchText}%` } },
      { lastname: { [Op.iLike]: `%${searchText}%` } },
      { description: { [Op.iLike]: `%${searchText}%` } },
    ];
  }
  if (minExperience !== null) {
    where.experience_years = { [Op.gte]: minExperience };
  }

  const mentorSkillWhere = {};
  if (skillId !== null) mentorSkillWhere.skill_id = skillId;
  if (subSkillId !== null) mentorSkillWhere.sub_skill_id = subSkillId;
  const filterBySkill = Object.keys(mentorSkillWhere).length > 0;

  const subSkillInclude = {
    model: SubSkill,
    attributes: SUB_SKILL_ATTRS,
    include: [{ model: Skill, attributes: SKILL_ATTRS }],
  };

  const include = [
    {
      model: MentorSkill,
      required: filterBySkill,
      where: filterBySkill ? mentorSkillWhere : undefined,
      include: [{ model: Skill, attributes: SKILL_ATTRS }, subSkillInclude],
    },
  ];

  return {
    page,
    limit,
    offset,
    where,
    include,
    order: [['user_id', 'ASC']],
  };
}
