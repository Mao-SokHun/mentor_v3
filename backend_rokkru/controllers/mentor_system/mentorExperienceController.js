// ============= Start mentor experience controller =============
import { Mentor, MentorExperience } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/apiResponse.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentor_system/assertOwner.js';

const EXPERIENCE_TYPES = new Set(['education', 'work']);

function parseExperienceId(value) {
  const id = parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

function parseMentorYear(value) {
  if (value === undefined || value === null || value === '') return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = String(value).trim();
  if (/^\d{4}$/.test(text)) {
    return new Date(`${text}-01-01`);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeExperienceType(value) {
  if (value === undefined || value === null || value === '') {
    return 'education';
  }
  const type = String(value).trim().toLowerCase();
  if (!EXPERIENCE_TYPES.has(type)) {
    return null;
  }
  return type;
}

async function findExperienceForMentor(experienceId, mentorId) {
  const item = await MentorExperience.findByPk(experienceId);
  if (!item || Number(item.mentor_id) !== mentorId) {
    return null;
  }
  return item;
}

const listExperience = async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    if (userId === null) {
      return fail(res, 'Invalid user id', 400);
    }

    const mentor = await Mentor.findByPk(userId);
    if (!mentor) {
      return fail(res, 'Mentor not found', 404);
    }

    const items = await MentorExperience.findAll({
      where: { mentor_id: userId },
      order: [['mentor_year', 'DESC'], ['mentor_experience_id', 'ASC']],
    });

    return ok(res, items.map((row) => row.get({ plain: true })));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const createExperience = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const mentor = await Mentor.findByPk(userId);
    if (!mentor) {
      return fail(res, 'Mentor not found', 404);
    }

    const {
      mentor_position,
      mentor_organization,
      mentor_year,
      experience_type,
    } = req.body;

    if (!mentor_position || !mentor_organization) {
      return fail(res, 'mentor_position and mentor_organization are required', 400);
    }

    const parsedYear = parseMentorYear(mentor_year);
    if (parsedYear === null) {
      return fail(res, 'mentor_year is required and must be a valid date or year', 400);
    }

    const parsedType = normalizeExperienceType(experience_type);
    if (parsedType === null) {
      return fail(res, "experience_type must be 'education' or 'work'", 400);
    }

    const item = await MentorExperience.create({
      mentor_id: userId,
      mentor_position: String(mentor_position).trim(),
      mentor_organization: String(mentor_organization).trim(),
      mentor_year: parsedYear,
      experience_type: parsedType,
    });

    return ok(res, item.get({ plain: true }), 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const updateExperience = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const experienceId = parseExperienceId(req.params.experienceId);
    if (experienceId === null) {
      return fail(res, 'Invalid experience id', 400);
    }

    const item = await findExperienceForMentor(experienceId, userId);
    if (!item) {
      return fail(res, 'Experience not found', 404);
    }

    const updates = {};

    if (req.body.mentor_position !== undefined) {
      const position = String(req.body.mentor_position).trim();
      if (!position) return fail(res, 'mentor_position cannot be empty', 400);
      updates.mentor_position = position;
    }

    if (req.body.mentor_organization !== undefined) {
      const organization = String(req.body.mentor_organization).trim();
      if (!organization) return fail(res, 'mentor_organization cannot be empty', 400);
      updates.mentor_organization = organization;
    }

    if (req.body.mentor_year !== undefined) {
      const parsedYear = parseMentorYear(req.body.mentor_year);
      if (parsedYear === null) {
        return fail(res, 'mentor_year must be a valid date or year', 400);
      }
      updates.mentor_year = parsedYear;
    }

    if (req.body.experience_type !== undefined) {
      const parsedType = normalizeExperienceType(req.body.experience_type);
      if (parsedType === null) {
        return fail(res, "experience_type must be 'education' or 'work'", 400);
      }
      updates.experience_type = parsedType;
    }

    if (Object.keys(updates).length === 0) {
      return fail(res, 'No fields to update', 400);
    }

    await item.update(updates);
    return ok(res, item.get({ plain: true }));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const deleteExperience = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const experienceId = parseExperienceId(req.params.experienceId);
    if (experienceId === null) {
      return fail(res, 'Invalid experience id', 400);
    }

    const deleted = await MentorExperience.destroy({
      where: {
        mentor_experience_id: experienceId,
        mentor_id: userId,
      },
    });

    if (!deleted) {
      return fail(res, 'Experience not found', 404);
    }

    return ok(res, { deleted: true, mentor_experience_id: experienceId });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export {
  listExperience,
  createExperience,
  updateExperience,
  deleteExperience,
};
// ============= End mentor experience controller =============
