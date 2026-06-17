// ============= Start assert owner helper =============
import { fail } from './apiResponse.js';
import { getAuthUserId } from './getAuthUserId.js';

function parseUserID(value) {
  const userID = parseInt(value, 10);
  const isValid = !Number.isNaN(userID);
  return isValid ? userID : null;
}

function assertOwner(req, res, targetUserID) {
  const target = parseUserID(targetUserID);
  if (target === null) {
    fail(res, 'Invalid user id', 400);
    return false;
  }

  const ownerId = getAuthUserId(req);
  if (ownerId === null) {
    fail(res, 'Unauthorized', 401);
    return false;
  }

  if (ownerId !== target) {
    fail(res, 'Forbidden', 403);
    return false;
  }
  return true;
}

export { parseUserID, assertOwner };
// ============= End assert owner helper =============
