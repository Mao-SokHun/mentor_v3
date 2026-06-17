import path from 'path';
import fs from 'fs/promises';
import { Mentor, Province } from '../../models/index.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';
import { parseUserID, assertOwner } from '../../utils/mentorSystem/assertOwner.js';
import { getAuthUserId } from '../../utils/mentorSystem/getAuthUserId.js';
import { buildMentorListQuery } from '../../utils/mentorSystem/mentorListQuery.js';
import { deleteMentorRelatedData } from '../../utils/mentorSystem/mentorDeleteHelpers.js';
import {
  buildProfilePictureUrl,
  removeStoredProfilePicture,
  resolveProfilePicturePath,
} from '../../utils/mentorSystem/profilePictureHelpers.js';

const MENTOR_WRITABLE_FIELDS = [
  'firstname',
  'lastname',
  'gender',
  'phone_number',
  'province_id',
  'experience_years',
  'description',
  'profile_picture',
];

const MENTOR_CREATE_FIELDS = MENTOR_WRITABLE_FIELDS;

const MENTOR_READ_INCLUDE = [
  { model: Province, attributes: ['province_id', 'province_name'] },
];

function pickBodyFields(body, fields) {
  const picked = {};
  for (const key of fields) {
    if (body[key] !== undefined) picked[key] = body[key];
  }
  return picked;
}

function parseOptionalIntField(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeMentorBody(body, fields) {
  const picked = pickBodyFields(body, fields);
  if (picked.province_id !== undefined) {
    picked.province_id = parseOptionalIntField(picked.province_id);
  }
  if (picked.experience_years !== undefined) {
    picked.experience_years = parseOptionalIntField(picked.experience_years);
  }
  return picked;
}

async function findMentorByUserId(userId, { includeProvince = false } = {}) {
  if (userId === null) return { error: 'Invalid user id', status: 400 };
  const mentor = await Mentor.findByPk(userId, {
    include: includeProvince ? MENTOR_READ_INCLUDE : undefined,
  });
  if (!mentor) return { error: 'Mentor not found', status: 404 };
  return { mentor };
}

const listMentors = async (req, res) => {
  try {
    const { page, limit, offset, where, include, order } = buildMentorListQuery(req);
    const { rows, count } = await Mentor.findAndCountAll({
      where,
      include: [...include, ...MENTOR_READ_INCLUDE],
      distinct: true,
      subQuery: false,
      limit,
      offset,
      order,
    });
    return ok(res, { item: rows, total: count, page, limit });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const searchMentors = listMentors;

const getMentorById = async (req, res) => {
  try {
    const result = await findMentorByUserId(parseUserID(req.params.userId), {
      includeProvince: true,
    });
    if (result.error) return fail(res, result.error, result.status);
    return ok(res, result.mentor);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const getMyMentor = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (userId === null) return fail(res, 'Unauthorized', 401);

    const mentor = await Mentor.findByPk(userId, { include: MENTOR_READ_INCLUDE });
    if (!mentor) return fail(res, 'Mentor profile not found', 404);
    return ok(res, mentor);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const createMentor = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (userId === null) return fail(res, 'Unauthorized', 401);
    if (await Mentor.findByPk(userId)) {
      return fail(res, 'Mentor profile already exists', 400);
    }

    const mentor = await Mentor.create({
      user_id: userId,
      ...normalizeMentorBody(req.body, MENTOR_CREATE_FIELDS),
      create_date: new Date(),
    });
    return ok(res, mentor, 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const updateMentor = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserID(req.params.userId);
    const result = await findMentorByUserId(userId);
    if (result.error) return fail(res, result.error, result.status);

    const updates = normalizeMentorBody(req.body, MENTOR_WRITABLE_FIELDS);
    if (Object.keys(updates).length === 0) {
      return fail(res, 'No fields to update', 400);
    }
    updates.update_date = new Date();
    await result.mentor.update(updates);
    await result.mentor.reload({ include: MENTOR_READ_INCLUDE });
    return ok(res, result.mentor);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const deleteMentor = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserID(req.params.userId);
    const mentor = await Mentor.findByPk(userId);
    if (!mentor) return fail(res, 'Mentor not found', 404);

    await deleteMentorRelatedData(userId, mentor);
    await mentor.destroy();
    return ok(res, { delete: true });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const serveProfilePicture = async (req, res) => {
  try {
    const userId = parseUserID(req.params.userId);
    if (userId === null) return fail(res, 'Invalid user id', 400);

    const resolved = resolveProfilePicturePath(userId, req.params.filename);
    if (resolved.error) return fail(res, resolved.error, 400);

    try {
      await fs.access(resolved.filePath);
    } catch {
      return fail(res, 'File not found', 404);
    }

    return res.sendFile(path.resolve(resolved.filePath));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const uploadProfilePicture = async (req, res) => {
  const userId = parseUserID(req.params.userId);
  try {
    if (!assertOwner(req, res, req.params.userId)) return;
    if (!req.file?.filename) return fail(res, 'Profile image file is required', 400);

    const mentor = await Mentor.findByPk(userId);
    if (!mentor) return fail(res, 'Mentor not found', 404);

    const previous = mentor.profile_picture;
    const pictureUrl = buildProfilePictureUrl(req, userId, req.file.filename);

    await mentor.update({
      profile_picture: pictureUrl,
      update_date: new Date(),
    });

    if (previous && previous !== pictureUrl) {
      await removeStoredProfilePicture(userId, previous);
    }

    return ok(res, { profile_picture: pictureUrl });
  } catch (error) {
    if (req.file?.filename && userId !== null) {
      await removeStoredProfilePicture(
        userId,
        buildProfilePictureUrl(req, userId, req.file.filename)
      );
    }
    return fail(res, error.message, 500);
  }
};

export {
  listMentors,
  searchMentors,
  getMentorById,
  getMyMentor,
  createMentor,
  updateMentor,
  deleteMentor,
  uploadProfilePicture,
  serveProfilePicture,
};
