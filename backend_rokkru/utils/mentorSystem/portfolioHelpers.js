import path from 'path';
import fs from 'fs/promises';
import { portfolioUploadDir } from '../../middleware/mentorSystem/portfolioUpload.js';

export const PORTFOLIO_ITEM_TYPES = new Set(['link', 'project', 'certificate', 'achievement']);

const MAX_LINK_LEN = 250;
const MAX_TAG_LEN = 250;
const MAX_DESC_LEN = 5000;
const MAX_TECH_COUNT = 20;
const MAX_TECH_LEN = 50;

export function normalizePortfolioLink(link) {
  const trimmed = String(link ?? '').trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_LINK_LEN) return null;
  if (!/^https?:\/\/.+/i.test(trimmed)) return null;
  return trimmed;
}

export function normalizeLinkTag(tag) {
  const trimmed = String(tag ?? '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_TAG_LEN);
}

export function normalizeDescription(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_DESC_LEN);
}

export function normalizeItemType(value) {
  const raw = String(value ?? 'link').trim().toLowerCase();
  return PORTFOLIO_ITEM_TYPES.has(raw) ? raw : 'link';
}

export function normalizePortfolioDate(value) {
  if (value == null || value === '') return null;
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const d = new Date(`${text}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : text;
}

export function parseTechnologiesInput(value) {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) {
    const list = value
      .map((v) => String(v).trim())
      .filter(Boolean)
      .slice(0, MAX_TECH_COUNT)
      .map((v) => v.slice(0, MAX_TECH_LEN));
    return list.length ? JSON.stringify(list) : null;
  }
  const text = String(value).trim();
  if (!text) return null;
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parseTechnologiesInput(parsed);
      }
    } catch {
      /* fall through */
    }
  }
  const list = text
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, MAX_TECH_COUNT)
    .map((v) => v.slice(0, MAX_TECH_LEN));
  return list.length ? JSON.stringify(list) : null;
}

export function technologiesToArray(stored) {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
  } catch {
    return [];
  }
}

export function buildPortfolioFileUrl(req, mentorId, storedName) {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const safeName = encodeURIComponent(String(storedName ?? ''));
  return `${protocol}://${host}/api/v1/portfolio-files/${mentorId}/${safeName}`;
}

export function parseAttachments(stored) {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyAttachments(list) {
  return list.length ? JSON.stringify(list) : null;
}

export function nextAttachmentId(attachments = []) {
  const ids = attachments.map((row) => Number(row.file_id)).filter((n) => Number.isFinite(n) && n > 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

export function buildAttachmentEntry(mentorId, file) {
  return {
    file_id: null,
    mentor_id: mentorId,
    stored_name: file.filename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size,
    create_date: new Date().toISOString(),
  };
}

export function serializePortfolioFile(fileRow, req) {
  if (!fileRow) return null;
  return {
    file_id: fileRow.file_id,
    mentor_id: fileRow.mentor_id,
    portfolio_link: fileRow.portfolio_link ?? null,
    file_name: fileRow.original_name,
    mime_type: fileRow.mime_type,
    file_size: fileRow.file_size,
    url: buildPortfolioFileUrl(req, fileRow.mentor_id, fileRow.stored_name),
    create_date: fileRow.create_date,
  };
}

export function serializePortfolioItem(row, req) {
  const plain = row?.get ? row.get({ plain: true }) : row;
  const attachmentRows = parseAttachments(plain.attachments).map((entry) => ({
    ...entry,
    mentor_id: plain.mentor_id,
    portfolio_link: plain.link,
  }));
  return {
    mentor_id: plain.mentor_id,
    link: plain.link,
    link_tag: plain.link_tag ?? null,
    description: plain.description ?? null,
    portfolio_date: plain.portfolio_date ?? null,
    technologies: technologiesToArray(plain.technologies),
    item_type: plain.item_type ?? 'link',
    sort_order: plain.sort_order ?? 0,
    files: attachmentRows.map((f) => serializePortfolioFile(f, req)),
  };
}

export async function appendAttachmentToItem(item, mentorId, file, maxFiles = 5) {
  const attachments = parseAttachments(item.attachments);
  if (attachments.length >= maxFiles) {
    throw new Error(`Maximum ${maxFiles} files per portfolio item`);
  }
  const entry = {
    ...buildAttachmentEntry(mentorId, file),
    file_id: nextAttachmentId(attachments),
  };
  const next = [...attachments, entry];
  await item.update({ attachments: stringifyAttachments(next) });
  return { ...entry, portfolio_link: item.link };
}

export function getAttachmentsFromItem(item) {
  const mentorId = item.mentor_id;
  return parseAttachments(item.attachments).map((entry) => ({
    ...entry,
    mentor_id: mentorId,
    portfolio_link: item.link,
  }));
}

export async function removeStoredFile(mentorId, storedName) {
  if (!storedName) return;
  const filePath = path.join(portfolioUploadDir(mentorId), storedName);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
  }
}

export async function deletePortfolioFilesForItem(mentorId, portfolioLink, fileRows = []) {
  await Promise.all(fileRows.map((row) => removeStoredFile(mentorId, row.stored_name)));
}
