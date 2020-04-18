const TypeUtils = require('node-utils-lc').TypeUtils;

/**
 * Api response (Immutable)
 */
class ApiResponse {
  /**
   * @param {string} type
   * @param {number} statusCode
   * @param {Object|*} payload
   * @param {boolean} [emptyBody]
   */
  constructor(type, statusCode, payload, emptyBody) {
    this._type = type;
    this._headers = {};
    this._statusCode = statusCode;
    this._payload = payload;
    this._emptyBody = emptyBody;
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
   * @typedef {{
   *   success:boolean,
   *   reason:?string,
   *   payload:?*
   * }} Response
   *
   * @return {Response|string}
   */
  buildResponse() {
    if (this._emptyBody) {
      return '';
    }
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
   * @param {*} payload
   * @return {ApiResponse}
   */
  static ok(payload) {
    return ApiResponse._buildResponse(200, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  static unprocessableEntity(payload) {
    return ApiResponse._buildResponse(423, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  static badRequest(payload) {
    return ApiResponse._buildResponse(400, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  static notFound(payload) {
    return ApiResponse._buildResponse(404, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  static forbidden(payload) {
    return ApiResponse._buildResponse(403, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  static serverError(payload) {
    return ApiResponse._buildResponse(500, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  static created(payload) {
    return ApiResponse._buildResponse(201, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  noContent(payload) {
    return ApiResponse._buildResponse(204, payload);
  }

  /**
   * @param {*} payload
   * @return {ApiResponse}
   */
  accepted(payload) {
    return ApiResponse._buildResponse(202, payload);
  }

  /**
   * @param {number} statusCode
   * @param {*} payload
   * @return {ApiResponse}
   */
  static withStatus(statusCode, payload) {
    return ApiResponse._buildResponse(statusCode, payload);
  }

  /**
   * @param {number} statusCode
   * @param {string|Object} payload
   * @return {ApiResponse}
   * @private
   */
  static _buildResponse(statusCode, payload) {
    const emptyBody = (payload === null || payload === false);
    return new ApiResponse(ApiResponse.TYPES.JSON,
        statusCode, payload, emptyBody);
  }
}

ApiResponse.TYPES = {
  JSON: 'json',
};

module.exports = ApiResponse;
