// ============= Start api response helpers =============
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

export { ok, fail };
// ============= End api response helpers =============
