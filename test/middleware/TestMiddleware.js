const HttpBase = require('../../lib/http/HttpBase');

class TestMiddleware extends HttpBase {
  execute() {
    this.logger.error('TestMiddleware');
  }
}

module.exports = TestMiddleware;
