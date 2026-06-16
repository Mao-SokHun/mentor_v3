/**
 * @typedef {string|number} EntityId
 */

/**
 * @typedef {Object} Teacher
 * @property {EntityId} id
 * @property {string} name
 * @property {string} [title]
 * @property {string[]} [subjects]
 * @property {string} [major]
 * @property {number} [rating]
 * @property {number} [reviewCount]
 * @property {number} [students]
 * @property {string} [location]
 * @property {number} [experience]
 * @property {boolean} [verified]
 * @property {boolean} [online]
 * @property {string} [bio]
 * @property {number} [price]
 * @property {string} [avatarUrl]
 */

/**
 * @typedef {Object} TeacherFilters
 * @property {string} [major]
 * @property {string} [subject]
 * @property {string} [location]
 * @property {string} [sort]
 * @property {string} [type]
 * @property {string} [time]
 */

/**
 * @typedef {Object} FilterOptionSet
 * @property {string[]} majors
 * @property {string[]} subjects
 * @property {string[]} locations
 * @property {string[]} [sorts]
 * @property {string[]} [types]
 * @property {string[]} [times]
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {Teacher[]} items
 * @property {number} total
 * @property {number} [page]
 * @property {number} [pageSize]
 */

/**
 * @typedef {Object} ApiListResponse
 * @property {Teacher[]} data
 * @property {number} [total]
 * @property {string} [message]
 */

export {}
