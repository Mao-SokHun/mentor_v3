import { Student } from '../../models/index.js';

export const attachStudentId = async (req, res, next) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const student = await Student.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!student) {
      return res.status(404).json({ 
        message: 'Student profile not found. Please complete your student profile first.' 
      });
    }

    req.user.student_id = student.user_id;
    next();
  } catch (error) {
    next(error);
  }
};