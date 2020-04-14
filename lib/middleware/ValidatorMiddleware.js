const Validator = require('node-libs-lc').Validator;
const TypeUtils = require('node-utils-lc').TypeUtils;
const HttpBase = require('../http/HttpBase');
const ApiResponse = require('../http/ApiResponse');

/**
 * Validator middleware
 */
class ValidatorMiddleware extends HttpBase {
  /**
   * Before handler
   */
  beforeExecute() {
    this._stringResource = this.strings.getResource('validation');
  }

  /**
   * @param {Object.<string,Object.<string,Object>>} fields
   * @param {Object.<string,string|number>} target
   * @return {Array.<string>}
   * @private
   */
  _runValidators(fields, target) {
    const errors = [];
    for (const field in fields) {
      if (Object.hasOwnProperty.call(fields, field)) {
        const validators = fields[field];
        for (const validator in validators) {
          if (Object.hasOwnProperty.call(validators, validator)) {
            let args = validators[validator];
            if (!TypeUtils.isArray(args)) {
              args = [args];
            }
            if (!Validator.validate(target[field], validator, ...args)) {
              errors.push(this._stringResource
                  .getString(validator, field, ...args));
            }
          }
        }
      }
    }
    return errors;
  }

  /**
   * @param {Request} req
   * @return {ApiResponse|undefined}
   */
  execute(req) {
    const validate = this.route.validate;
    let errors = [];
    errors = errors.concat(
        this._runValidators(validate.body || {}, req.body || {}));
    errors = errors.concat(
        this._runValidators(validate.query || {}, req.query || {}));
    if (errors.length > 0) {
      return ApiResponse.badRequest(errors);
    }
  }
}

module.exports = ValidatorMiddleware;
