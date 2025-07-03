/**
 * Standart hata sınıfı
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  /**
   * @constructor
   * @param {number} statusCode - Hata durumu kodu
   * @param {string} message - Hata mesajı
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
