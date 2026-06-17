// ============= Start mentor skills controller =============

import { MentorSkill, Skill, SubSkill } from '../../models/index.js';
import { SKILL_ATTRS, SUB_SKILL_ATTRS } from '../../utils/mentorSystem/skillDisplayName.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentorSystem/assertOwner.js';

const skillInclude = [
  {
    model: Skill,
    attributes: SKILL_ATTRS,
  },
  {
    model: SubSkill,
    attributes: SUB_SKILL_ATTRS,
    include: [
      {
        model: Skill,
        attributes: SKILL_ATTRS,
      },
    ],
  },
];

// Start list all skills
const listSkill = async (req, res) => {
  try {
    const skill = await Skill.findAll({
      attributes: SKILL_ATTRS,
      include: [{
        model: SubSkill,
        attributes: SUB_SKILL_ATTRS,
        order: [['sub_skill_name', 'ASC']],
      }],
      order: [['skill_name', 'ASC']],
    });
    // skill: skill_name / skill_name_kh — sub_skill: sub_skill_name / sub_skill_name_kh
    return ok(res, skill.map((row) => row.get({ plain: true })));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const listMentorSkills = async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    if (userId === null) {
      return fail(res, 'Invalid user id', 400);
    }
    const items = await MentorSkill.findAll({
      where: { user_id: userId },
      include: skillInclude,
      order: [['ms_id', 'ASC']],
    });

    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const addMentorSkill = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const subSkillId = parseInt(req.body.sub_skill_id, 10);
    if (Number.isNaN(subSkillId)) {
      return fail(res, 'sub_skill_id is required', 400);
    }

    const subSkill = await SubSkill.findByPk(subSkillId);
    if (!subSkill) {
      return fail(res, 'Sub-skill not found', 404);
    }

    const parentSkillId = Number(subSkill.skill_id);
    if (!parentSkillId) {
      return fail(res, 'Sub-skill has no parent skill', 400);
    }

    const requestedSkillId =
      req.body.skill_id !== undefined && req.body.skill_id !== null
        ? parseInt(req.body.skill_id, 10)
        : null;
    if (
      requestedSkillId !== null &&
      !Number.isNaN(requestedSkillId) &&
      requestedSkillId !== parentSkillId
    ) {
      return fail(res, 'skill_id does not match sub_skill_id', 400);
    }

    const existing = await MentorSkill.findOne({
      where: { user_id: userId, sub_skill_id: subSkillId },
    });
    if (existing) {
      const withNames = await MentorSkill.findByPk(existing.ms_id, { include: skillInclude });
      return ok(res, withNames, 200);
    }

    const item = await MentorSkill.create({
      user_id: userId,
      skill_id: parentSkillId,
      sub_skill_id: subSkillId,
    });
    const withNames = await MentorSkill.findByPk(item.ms_id, { include: skillInclude });

    return ok(res, withNames, 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const deleteMentorSkill = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const subSkillId = parseInt(req.params.subSkillId, 10);
    if (Number.isNaN(subSkillId)) {
      return fail(res, 'Invalid sub skill id', 400);
    }

    const deleted = await MentorSkill.destroy({
      where: { user_id: userId, sub_skill_id: subSkillId },
    });
    if (!deleted) {
      return fail(res, 'Skill not found', 404);
    }
    return ok(res, { deleted: true });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export { listSkill, listMentorSkills, addMentorSkill, deleteMentorSkill };
// ============= End mentor skills controller =============
