const HttpBase = require('../http/HttpBase');

/**
 * Request logger
 */
class RequestLoggerMiddleware extends HttpBase {
  /**
   * @param {Request} req
   */
  execute(req) {
    const route = this.route;
    const url = `${route.requestMethod}:${route.path}?${req.getQuery()}`;
    const log = `${route.operationId} -> ${url}`;
    this.logger.info(log);
  }
}

module.exports = RequestLoggerMiddleware;
