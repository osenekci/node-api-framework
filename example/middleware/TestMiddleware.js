const HttpBase = require('../../src/http/HttpBase');

class TestMiddleware extends HttpBase {
  execute() {
    this.logger.error('TestMiddleware');
  }
}

module.exports = TestMiddleware;
