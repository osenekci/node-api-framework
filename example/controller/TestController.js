const HttpBase = require('../../src/http/HttpBase');
const ApiResponse = require('../../src/http/ApiResponse');

class TestController extends HttpBase {
  test() {
    return ApiResponse.ok('Hellooo!');
  }
}

module.exports = TestController;
