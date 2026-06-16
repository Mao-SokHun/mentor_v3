// DEV ONLY — REMOVE BEFORE PRODUCTION
import { Student } from '../../models/index.js';

export const devBypass = async (req, res, next) => {
  // Activate only when explicitly enabled
  if (process.env.DEV_BYPASS_AUTH !== 'true') return next();

  try {
    // Inject a mock authenticated student user for local/dev testing
    req.user = {
      user_id: 138,
      email: 'test@rokkru.com',
      status: 'active',
      role: 'student'
    };

    // Try to attach student_id if a Student record exists
    const student = await Student.findOne({ where: { user_id: req.user.user_id } });
    req.user.student_id = student ? student.user_id : null;






    
    next();
  } catch (error) {
    next(error);
  }
};
