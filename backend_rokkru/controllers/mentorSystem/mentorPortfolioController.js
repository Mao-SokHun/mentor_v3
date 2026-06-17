// ============= Start mentor portfolio controller =============

import path from 'path';
import fs from 'fs/promises';
import { MentorPortfolio } from '../../models/index.js';
import { portfolioUploadDir } from '../../middleware/mentorSystem/portfolioUpload.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentorSystem/assertOwner.js';
import { PORTFOLIO_MAX_FILES_PER_ITEM } from '../../middleware/mentorSystem/portfolioUpload.js';
import {
  normalizePortfolioLink,
  normalizeLinkTag,
  normalizeDescription,
  normalizeItemType,
  normalizePortfolioDate,
  parseTechnologiesInput,
  buildPortfolioFileUrl,
  serializePortfolioItem,
  serializePortfolioFile,
  deletePortfolioFilesForItem,
  removeStoredFile,
  parseAttachments,
  stringifyAttachments,
  buildAttachmentEntry,
  appendAttachmentToItem,
  getAttachmentsFromItem,
} from '../../utils/mentorSystem/portfolioHelpers.js';

function buildCreatePayload(body, mentorId) {
  const link = normalizePortfolioLink(body?.link);
  if (!link) return { error: 'A valid http(s) portfolio link is required' };

  return {
    value: {
      user_id: mentorId,
      link,
      link_tag: normalizeLinkTag(body?.link_tag ?? body?.title),
      description: normalizeDescription(body?.description),
      portfolio_date: normalizePortfolioDate(body?.portfolio_date),
      technologies: parseTechnologiesInput(body?.technologies),
      item_type: normalizeItemType(body?.item_type),
      sort_order: Number.isFinite(Number(body?.sort_order)) ? Number(body.sort_order) : 0,
    },
  };
}

function buildUpdatePayload(body) {
  const updates = {};
  if (body?.link_tag !== undefined || body?.title !== undefined) {
    updates.link_tag = normalizeLinkTag(body.link_tag ?? body.title);
  }
  if (body?.description !== undefined) {
    updates.description = normalizeDescription(body.description);
  }
  if (body?.portfolio_date !== undefined) {
    updates.portfolio_date = normalizePortfolioDate(body.portfolio_date);
  }
  if (body?.technologies !== undefined) {
    updates.technologies = parseTechnologiesInput(body.technologies);
  }
  if (body?.item_type !== undefined) {
    updates.item_type = normalizeItemType(body.item_type);
  }
  if (body?.sort_order !== undefined) {
    const n = Number(body.sort_order);
    if (Number.isFinite(n)) updates.sort_order = n;
  }
  return updates;
}

async function findPortfolioItem(mentorId, link) {
  return MentorPortfolio.findOne({ where: { user_id: mentorId, link } });
}

/** GET /portfolio-files/:mentorId/:filename — public file download (no app.js static mount) */
const servePortfolioFile = async (req, res) => {
  try {
    const mentorId = parseUserId(req.params.mentorId);
    if (mentorId === null) return fail(res, 'Invalid mentor id', 400);

    const filename = path.basename(decodeURIComponent(req.params.filename ?? ''));
    if (!filename || !/^[\w.-]+$/.test(filename)) {
      return fail(res, 'Invalid file name', 400);
    }

    const filePath = path.join(portfolioUploadDir(mentorId), filename);
    try {
      await fs.access(filePath);
    } catch {
      return fail(res, 'File not found', 404);
    }

    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** GET /mentors/:userId/portfolio */
const listPortfolio = async (req, res) => {
  try {
    const mentorId = parseUserId(req.params.userId);
    if (mentorId === null) {
      return fail(res, 'Invalid user id', 400);
    }
    const items = await MentorPortfolio.findAll({
      where: { user_id: mentorId },
      order: [
        ['sort_order', 'ASC'],
        ['link', 'ASC'],
      ],
    });
    const payload = items.map((row) => serializePortfolioItem(row, req));
    return ok(res, payload, 200);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** POST /mentors/:userId/portfolio — JSON body (legacy + rich fields) */
const creatPortfolio = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    const built = buildCreatePayload(req.body, mentorId);
    if (built.error) return fail(res, built.error, 400);

    const existing = await MentorPortfolio.findOne({
      where: { user_id: mentorId, link: built.value.link },
    });
    if (existing) {
      return fail(res, 'Portfolio link already exists', 409);
    }

    const item = await MentorPortfolio.create(built.value);
    return ok(res, serializePortfolioItem(item, req), 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** POST /mentors/:userId/portfolio/with-file — multipart: file + metadata */
const createPortfolioWithFile = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    if (!req.file) {
      return fail(res, 'Portfolio file is required', 400);
    }

    let link = normalizePortfolioLink(req.body?.link);
    if (!link) {
      link = buildPortfolioFileUrl(req, mentorId, req.file.filename);
    }

    const existing = await MentorPortfolio.findOne({
      where: { user_id: mentorId, link },
    });
    if (existing) {
      await removeStoredFile(mentorId, req.file.filename);
      return fail(res, 'Portfolio link already exists', 409);
    }

    const attachment = {
      ...buildAttachmentEntry(mentorId, req.file),
      file_id: 1,
    };

    const item = await MentorPortfolio.create({
      user_id: mentorId,
      link,
      link_tag: normalizeLinkTag(req.body?.link_tag ?? req.body?.title) || req.file.originalname,
      description: normalizeDescription(req.body?.description),
      portfolio_date: normalizePortfolioDate(req.body?.portfolio_date),
      technologies: parseTechnologiesInput(req.body?.technologies),
      item_type: normalizeItemType(req.body?.item_type ?? 'certificate'),
      sort_order: Number.isFinite(Number(req.body?.sort_order)) ? Number(req.body.sort_order) : 0,
      attachments: stringifyAttachments([attachment]),
    });

    return ok(res, serializePortfolioItem(item, req), 201);
  } catch (error) {
    if (req.file?.filename) {
      await removeStoredFile(parseUserId(req.params.userId), req.file.filename).catch(() => {});
    }
    return fail(res, error.message, 500);
  }
};

/** PATCH /mentors/:userId/portfolio/:link */
const updatePortfolio = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    if (mentorId === null) {
      return fail(res, 'Invalid user id', 400);
    }

    const link = decodeURIComponent(req.params.link);
    const item = await findPortfolioItem(mentorId, link);
    if (!item) {
      return fail(res, 'Portfolio item not found', 404);
    }

    if (req.body.link !== undefined && req.body.link !== link) {
      return fail(res,
        'To change the URL, delete this item and create a new one',
        400
      );
    }

    const updates = buildUpdatePayload(req.body);
    if (Object.keys(updates).length === 0) {
      return fail(res, 'No fields to update', 400);
    }

    await item.update(updates);
    return ok(res, serializePortfolioItem(item, req));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** DELETE /mentors/:userId/portfolio/:link */
const deletePortfolio = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    const link = decodeURIComponent(req.params.link);

    const item = await findPortfolioItem(mentorId, link);
    if (!item) {
      return fail(res, 'Portfolio item not found', 404);
    }

    const files = getAttachmentsFromItem(item);
    await deletePortfolioFilesForItem(mentorId, link, files);
    await MentorPortfolio.destroy({
      where: { user_id: mentorId, link },
    });

    return ok(res, { deleted: true });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** GET /mentors/:userId/portfolio/:link/files */
const listPortfolioFiles = async (req, res) => {
  try {
    const mentorId = parseUserId(req.params.userId);
    if (mentorId === null) return fail(res, 'Invalid user id', 400);

    const link = decodeURIComponent(req.params.link);
    const item = await findPortfolioItem(mentorId, link);
    if (!item) return fail(res, 'Portfolio item not found', 404);

    const files = getAttachmentsFromItem(item);
    return ok(res, files.map((f) => serializePortfolioFile(f, req)));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

/** POST /mentors/:userId/portfolio/:link/files */
const uploadPortfolioFile = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    if (!req.file) return fail(res, 'Portfolio file is required', 400);

    const link = decodeURIComponent(req.params.link);
    const item = await findPortfolioItem(mentorId, link);
    if (!item) {
      await removeStoredFile(mentorId, req.file.filename);
      return fail(res, 'Portfolio item not found', 404);
    }

    const count = parseAttachments(item.attachments).length;
    if (count >= PORTFOLIO_MAX_FILES_PER_ITEM) {
      await removeStoredFile(mentorId, req.file.filename);
      return fail(res, `Maximum ${PORTFOLIO_MAX_FILES_PER_ITEM} files per portfolio item`, 400);
    }

    const fileRow = await appendAttachmentToItem(item, mentorId, req.file);
    return ok(res, serializePortfolioFile(fileRow, req), 201);
  } catch (error) {
    if (req.file?.filename) {
      await removeStoredFile(parseUserId(req.params.userId), req.file.filename).catch(() => {});
    }
    return fail(res, error.message, 500);
  }
};

/** DELETE /mentors/:userId/portfolio/:link/files/:fileId */
const deletePortfolioFile = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    const link = decodeURIComponent(req.params.link);
    const fileId = Number(req.params.fileId);
    if (!fileId || Number.isNaN(fileId)) return fail(res, 'Invalid file id', 400);

    const item = await findPortfolioItem(mentorId, link);
    if (!item) return fail(res, 'Portfolio item not found', 404);

    const attachments = parseAttachments(item.attachments);
    const fileRow = attachments.find((row) => Number(row.file_id) === fileId);
    if (!fileRow) return fail(res, 'Portfolio file not found', 404);

    const remaining = attachments.filter((row) => Number(row.file_id) !== fileId);
    await item.update({ attachments: stringifyAttachments(remaining) });
    await removeStoredFile(mentorId, fileRow.stored_name);

    return ok(res, { deleted: true, file_id: fileId });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export {
  servePortfolioFile,
  listPortfolio,
  creatPortfolio,
  createPortfolioWithFile,
  updatePortfolio,
  deletePortfolio,
  listPortfolioFiles,
  uploadPortfolioFile,
  deletePortfolioFile,
};
// ============= End mentor portfolio controller =============
