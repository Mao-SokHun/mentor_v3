/**
 * @typedef {Object} ApiErrorBody
 * @property {string} [error]
 * @property {string} [message]
 * @property {string} [code]
 */

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} [status]
   * @param {ApiErrorBody} [body]
   */
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}
