/** Read logged-in user id from auth middleware (`req.user.user_id`). */
// ============= Start get auth user id =============
function getAuthUserId(req) {
  const raw = req.user?.user_id;
  if (raw == null) return null;
  const id = Number(raw);
  return Number.isNaN(id) ? null : id;
}

export { getAuthUserId };
// ============= End get auth user id =============
