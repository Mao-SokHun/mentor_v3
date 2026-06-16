// ============= Start province controller =============
import { Province } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/apiResponse.js';

const listAllProvinces = async (req, res) => {
  try {
    const items = await Province.findAll({
      order: [['province_name', 'ASC']],
    });
    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};






export { listAllProvinces };
// ============= End province controller =============
