const TypeUtils = require('node-utils-lc').TypeUtils;

/**
 * Api response (Immutable)
 */
class ApiResponse {
  /**
   * @param {string} type
   * @param {number} statusCode
   * @param {Object|*} payload
   */
  constructor(type, statusCode, payload) {
    this._type = type;
    this._headers = {};
    this._statusCode = statusCode;
    this._payload = payload;
    if (type === ApiResponse.TYPES.JSON) {
      this.addHeader('Content-Type', 'application/json');
    }
  }

  /**
   * @param {Object.<string,string>} headers
   */
  setHeaders(headers) {
    this._headers = headers;
  }

  /**
   * @return {Object.<string,string>}
   */
  getHeaders() {
    return this._headers;
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  addHeader(name, value) {
    this._headers[name] = value;
  }

  /**
   * @param {string} type
   * @return {boolean}
   */
  isType(type) {
    return this._type === type;
  }

  /**
   * @return {{
   *   success:boolean,
   *   reason:?string,
   *   payload:?*
   * }}
   */
  buildResponse() {
    const response = {};
    response.success = this._statusCode >= 200 && this._statusCode < 300;
    if (!response.success && TypeUtils.isString(this._payload)) {
      response.reason = this._payload;
    } else {
      response.payload = this._payload;
    }
    return response;
  }

  /**
   * @param {string|Object} payload
   * @return {ApiResponse}
   */
  static ok(payload) {
    return ApiResponse._buildResponse(200, payload);
  }

  /**
   * @param {string|Object} payload
   * @return {ApiResponse}
   */
  static unprocessableEntity(payload) {
    return ApiResponse._buildResponse(423, payload || 'Unprocessable entity');
  }

  /**
   * @param {string|Object} payload
   * @return {ApiResponse}
   */
  static badRequest(payload) {
    return ApiResponse._buildResponse(400, payload || 'Bad request');
  }

  /**
   * @param {string|Object} payload
   * @return {ApiResponse}
   */
  static notFound(payload) {
    return ApiResponse._buildResponse(404, payload || 'Not found');
  }

  /**
   * @param {string|Object} payload
   * @return {ApiResponse}
   */
  static forbidden(payload) {
    return ApiResponse._buildResponse(403, payload || 'Forbidden');
  }

  /**
   * @param {number} statusCode
   * @param {string|Object} payload
   * @return {ApiResponse}
   * @private
   */
  static _buildResponse(statusCode, payload) {
    return new ApiResponse(ApiResponse.TYPES.JSON, statusCode, payload);
  }
}

ApiResponse.TYPES = {
  JSON: 'json',
};

module.exports = ApiResponse;
