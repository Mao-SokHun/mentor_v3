import { body, param, query, validationResult } from 'express-validator';
import { Student, User, UserType } from '../../models/index.js';
import { paginated, success, created } from '../../utils/response.js';
import { getPagination, buildPaginationMeta, buildSortOrder, buildSearchWhere } from '../../utils/pagination.js';
import { Op } from 'sequelize';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      })),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

const validateCreateStudent = [
  body('user_id')
    .notEmpty().withMessage('user_id is required')
    .isInt({ min: 1 }).withMessage('user_id must be a positive integer')
    .custom(async (value) => {
      const existingStudent = await Student.findByPk(value);
      if (existingStudent) {
        throw new Error('Student profile already exists for this user');
      }
      const user = await User.findByPk(value);
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    }),
  body('firstname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('firstname must be 1-100 chars')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('firstname contains invalid characters'),
  body('lastname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('lastname must be 1-100 chars')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('lastname contains invalid characters'),
  body('phone_number')
    .optional()
    .trim()
    .matches(/^[0-9\+\-\s()]+$/).withMessage('Invalid phone number format')
    .isLength({ max: 100 }).withMessage('phone_number too long'),
  body('study_major')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('study_major max 100 chars'),
  body('university')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('university max 150 chars'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('description max 200 chars'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 250 }).withMessage('address max 250 chars'),
  handleValidationErrors
];

const validateUpdateStudent = [
  param('id')
    .notEmpty().withMessage('Student ID is required')
    .isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  body('firstname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('firstname must be 1-100 chars')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('firstname contains invalid characters'),
  body('lastname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('lastname must be 1-100 chars')
    .matches(/^[a-zA-Z\s\-']+$/).withMessage('lastname contains invalid characters'),
  body('phone_number')
    .optional()
    .trim()
    .matches(/^[0-9\+\-\s()]+$/).withMessage('Invalid phone number format')
    .isLength({ max: 100 }).withMessage('phone_number too long'),
  body('study_major')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('study_major max 100 chars'),
  body('university')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('university max 150 chars'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('description max 200 chars'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 250 }).withMessage('address max 250 chars'),
  handleValidationErrors
];

const validateStudentId = [
  param('id')
    .notEmpty().withMessage('Student ID is required')
    .isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  handleValidationErrors
];

const validateListStudents = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('search term too long'),
  query('university')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('university filter too long'),
  query('study_major')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('study_major filter too long'),
  query('sortBy')
    .optional()
    .isIn(['firstname', 'lastname', 'create_date', 'university', 'study_major'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('sortOrder must be asc or desc'),
  handleValidationErrors
];

export const getStudents = [
  validateListStudents,
  async (req, res, next) => {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { search, university, study_major, sortBy, sortOrder } = req.query;

      const where = {};

      if (search) {
        Object.assign(where, buildSearchWhere(search, [
          'firstname', 'lastname', 'university', 'study_major', 'address'
        ], Op));
      }

      if (university) {
        where.university = { [Op.iLike]: `%${university}%` };
      }
      if (study_major) {
        where.study_major = { [Op.iLike]: `%${study_major}%` };
      }

      const order = buildSortOrder(
        { sortBy, sortOrder },
        ['firstname', 'lastname', 'create_date', 'university', 'study_major'],
        'create_date'
      );

      const { count, rows: students } = await Student.findAndCountAll({
        where,
        order,
        limit,
        offset,
        include: [
          {
            model: User,
            attributes: ['user_id', 'email', 'status'],
            include: [
              {
                model: UserType,
                attributes: ['user_type_name']
              }
            ]
          }
        ]
      });

      const paginationMeta = buildPaginationMeta(page, limit, count);

      return paginated(res, students, paginationMeta, 'Students retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
];

export const getStudentById = [
  validateStudentId,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ['user_id', 'email', 'status'],
            include: [
              {
                model: UserType,
                attributes: ['user_type_name']
              }
            ]
          }
        ]
      });

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      return success(res, student, 'Student retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
];

export const createStudent = [
  validateCreateStudent,
  async (req, res, next) => {
    try {
      const {
        user_id,
        firstname,
        lastname,
        phone_number,
        study_major,
        university,
        description,
        address
      } = req.body;

      const student = await Student.create({
        user_id,
        firstname: firstname || null,
        lastname: lastname || null,
        phone_number: phone_number || null,
        study_major: study_major || null,
        university: university || null,
        description: description || null,
        address: address || null,
        create_date: new Date()
      });

      const createdStudent = await Student.findByPk(student.user_id, {
        include: [
          {
            model: User,
            attributes: ['user_id', 'email', 'status'],
            include: [
              {
                model: UserType,
                attributes: ['user_type_name']
              }
            ]
          }
        ]
      });

      return created(res, createdStudent, 'Student profile created successfully');
    } catch (err) {
      next(err);
    }
  }
];

export const updateStudent = [
  validateUpdateStudent,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = {};

      const allowedFields = ['firstname', 'lastname', 'phone_number', 'study_major', 'university', 'description', 'address'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field] || null;
        }
      });

      updateData.update_date = new Date();

      const [updatedRows] = await Student.update(updateData, {
        where: { user_id: id }
      });

      if (updatedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const updatedStudent = await Student.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ['user_id', 'email', 'status'],
            include: [
              {
                model: UserType,
                attributes: ['user_type_name']
              }
            ]
          }
        ]
      });

      return success(res, updatedStudent, 'Student profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
];

export const deleteStudent = [
  validateStudentId,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      await Student.destroy({
        where: { user_id: id }
      });

      return success(res, null, 'Student profile deleted successfully');
    } catch (err) {
      next(err);
    }
  }
];

export const getMyProfile = [
  async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const student = await Student.findByPk(userId, {
        include: [
          {
            model: User,
            attributes: ['user_id', 'email', 'status'],
            include: [
              {
                model: UserType,
                attributes: ['user_type_name']
              }
            ]
          }
        ]
      });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      return res.status(200).json({ success: true, data: student });
    } catch (err) {
      next(err);
    }
  }
];

export const updateMyProfile = [
  async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const updateData = {};

      const allowedFields = ['firstname', 'lastname', 'phone_number', 'study_major', 'university', 'description', 'address'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field] || null;
        }
      });

      updateData.update_date = new Date();

      const [updatedRows] = await Student.update(updateData, {
        where: { user_id: userId }
      });

      if (updatedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const updatedStudent = await Student.findByPk(userId, {
        include: [
          {
            model: User,
            attributes: ['user_id', 'email', 'status'],
            include: [
              {
                model: UserType,
                attributes: ['user_type_name']
              }
            ]
          }
        ]
      });

      return success(res, updatedStudent, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
];
