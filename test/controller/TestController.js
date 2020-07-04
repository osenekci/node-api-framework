const HttpBase = require('../../lib/http/HttpBase');
const ApiResponse = require('../../lib/http/ApiResponse');

class TestController extends HttpBase {
  test() {
    return ApiResponse.ok('Hellooo!');
  }
}

module.exports = TestController;
