// ============= Start province controller =============
import { Province } from '../../models/index.js';
import { PROVINCE_ATTRS } from '../../utils/mentorSystem/skillDisplayName.js';
import { ok, fail } from '../../utils/mentorSystem/apiResponse.js';

const listAllProvinces = async (req, res) => {
  try {
    const items = await Province.findAll({
      attributes: PROVINCE_ATTRS,
      order: [['province_name', 'ASC']],
    });
    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export { listAllProvinces };
// ============= End province controller =============
