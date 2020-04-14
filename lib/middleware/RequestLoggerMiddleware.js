const TypeUtils = require('node-utils-lc').TypeUtils;
const HttpBase = require('../http/HttpBase');
const Logger = require('node-libs-lc').Logger;

let requestLogger;

/**
 * Request logger
 */
class RequestLoggerMiddleware extends HttpBase {
  /**
   * Create logger instance only once
   * requestLogger type:
   *  - null: no configuration
   *  - undefined: not initialized yet
   *  - Logger: configured and ready
   */
  beforeExecute() {
    if (TypeUtils.isUndefined(requestLogger)) {
      const loggerConfig = this.config.get('app.server.logger');
      if (loggerConfig) {
        requestLogger = new Logger(loggerConfig.config);
      } else {
        requestLogger = null;
      }
    }
  }

  /**
   * @param {Request} req
   */
  execute(req) {
    if (requestLogger) {
      requestLogger.info(`Request made to ${req.getPath()}`);
    }
  }
}

module.exports = RequestLoggerMiddleware;
