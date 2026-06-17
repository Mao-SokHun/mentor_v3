import {
  Student,
  User,
  AccountHistory,
  AccountHistoryLog
} from '../../models/index.js';
import { success, paginated, notFound } from '../../utils/response.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { Op } from 'sequelize';

/**
 * @desc    Get account change history (email/password changes)
 * @route   GET /api/v1/students/history/account
 * @access  Private (Student only)
 */
export const getAccountHistory = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const student = await Student.findByPk(userId);
    if (!student) {
      return notFound(res, 'Student profile not found', 'STUDENT_NOT_FOUND');
    }

    const { page, limit, offset } = getPagination(req.query);

    const { count, rows: histories } = await AccountHistory.findAndCountAll({
      where: { user_id: userId },
      order: [['change_at', 'DESC']],
      limit,
      offset
    });

    const paginationMeta = buildPaginationMeta(page, limit, count);
    return paginated(res, histories, paginationMeta, 'Account history retrieved');

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get account activity logs (login/logout/actions)
 * @route   GET /api/v1/students/history/logs
 * @access  Private (Student only)
 */
export const getAccountLogs = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const student = await Student.findByPk(userId);
    if (!student) {
      return notFound(res, 'Student profile not found', 'STUDENT_NOT_FOUND');
    }

    const { page, limit, offset } = getPagination(req.query);

    const { count, rows: logs } = await AccountHistoryLog.findAndCountAll({
      where: { user_id: userId },
      order: [['id', 'DESC']],
      limit,
      offset
    });

    const paginationMeta = buildPaginationMeta(page, limit, count);
    return paginated(res, logs, paginationMeta, 'Account logs retrieved');

  } catch (err) {
    next(err);
  }
};



/**
 * @desc    Get combined full history (account changes + activity logs)
 * @route   GET /api/v1/students/history
 * @access  Private (Student only)
 */
export const getFullHistory = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const student = await Student.findByPk(userId, {
      include: [
        {
          model: User,
          attributes: ['user_id', 'email', 'status']
        }
      ]
    });

    if (!student) {
      return notFound(res, 'Student profile not found', 'STUDENT_NOT_FOUND');
    }

    // Get last 5 of each type
    const [accountHistories, accountLogs] = await Promise.all([
      AccountHistory.findAll({
        where: { user_id: userId },
        order: [['change_at', 'DESC']],
        limit: 5
      }),
      AccountHistoryLog.findAll({
        where: { user_id: userId },
        order: [['id', 'DESC']],
        limit: 5
      })
    ]);

    // Stats
    const totalAccountChanges = await AccountHistory.count({ where: { user_id: userId } });
    const totalAccountLogs = await AccountHistoryLog.count({ where: { user_id: userId } });

    return success(res, {
      profile: {
        user_id: student.user_id,
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.User?.email
      },
      stats: {
        total_account_changes: totalAccountChanges,
        total_account_logs: totalAccountLogs
      },
      recent_account_changes: accountHistories,
      recent_account_logs: accountLogs
    }, 'Full history retrieved successfully');

  } catch (err) {
    next(err);
  }
};
