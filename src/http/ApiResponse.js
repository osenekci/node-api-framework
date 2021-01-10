/**
 * Api response (Immutable)
 */
class ApiResponse {
  /**
   * @param {string} type
   * @param {number} statusCode
   * @param {Object|*} [payload]
   */
  constructor(type, statusCode, payload) {
    this._type = type;
    this._headers = {};
    this._statusCode = statusCode;
    this._payload = payload;
    if (type === ApiResponse.TYPES.JSON) {
      this.addHeader('Content-Type', 'application/json');
    } else if (type === ApiResponse.TYPES.TEXT) {
      this.addHeader('Content-Type', 'text/plain');
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
   * @return {boolean}
   */
  isTextFormat() {
    return ([
      ApiResponse.TYPES.TEXT,
      ApiResponse.TYPES.JSON,
    ].indexOf(this._type) >= 0);
  }

  /**
   * @typedef {{
   *   success:boolean,
   *   reason:?string,
   *   payload:?*
   * }} Response
   *
   * @param {boolean} [disableSchema]
   * @return {Response|string}
   */
  buildResponse(disableSchema) {
    if (!this._payload) {
      return null;
    }
    // disableSchema default is true
    if (disableSchema === true) {
      return this._payload;
    }
    const response = {};
    response.success = this._statusCode >= 200 && this._statusCode < 300;
    if (!response.success) {
      response.reason = this._payload;
    } else {
      response.payload = this._payload;
    }
    return response;
  }

  /**
   * @return {number}
   */
  getStatusCode() {
    return this._statusCode;
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static ok(payload) {
    return ApiResponse._buildResponse(200, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static unprocessableEntity(payload) {
    return ApiResponse._buildResponse(423, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static badRequest(payload) {
    return ApiResponse._buildResponse(400, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static notFound(payload) {
    return ApiResponse._buildResponse(404, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static forbidden(payload) {
    return ApiResponse._buildResponse(403, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static serverError(payload) {
    return ApiResponse._buildResponse(500, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static created(payload) {
    return ApiResponse._buildResponse(201, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static noContent(payload) {
    return ApiResponse._buildResponse(204, payload);
  }

  /**
   * @param {*} [payload]
   * @return {ApiResponse}
   */
  static accepted(payload) {
    return ApiResponse._buildResponse(202, payload);
  }

  /**
   * @param {number} statusCode
   * @param {*} [payload]
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
    const emptyBody = !payload;
    let type = ApiResponse.TYPES.JSON;
    if (emptyBody) {
      type = ApiResponse.TYPES.TEXT;
    }
    return new ApiResponse(type, statusCode, payload);
  }
}

ApiResponse.TYPES = {
  JSON: 'json',
  TEXT: 'text',
};

module.exports = ApiResponse;
