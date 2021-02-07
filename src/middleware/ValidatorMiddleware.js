const HttpBase = require('../http/HttpBase');
const ApiResponse = require('../http/ApiResponse');
const Validator = require('../lib/Validator');
const _ = require('lodash');

/**
 * Validator middleware
 */
class ValidatorMiddleware extends HttpBase {
  /**
   * @param {Object} input
   * @param {string} name
   * @return {string}
   * @private
   */
  _getValue(input, name) {
    if (_.isUndefined(input[name])) {
      return '';
    }
    if (_.isNull(input[name])) {
      return '';
    }
    // Stringify
    return `${input[name]}`;
  }

  /**
   * @param {string} ruleName
   * @param {Array.<string|number>} params
   * @return {string}
   * @private
   */
  _createErrorMessage(ruleName, ...params) {
    const templates = this.config.get('validation.templates');
    if (_.isUndefined(templates)) {
      return ruleName;
    }
    if (_.isUndefined(templates[ruleName])) {
      return ruleName;
    }
    let str = templates[ruleName];
    params.forEach((param, i) => {
      str = str.split(`{${i}}`).join(param);
    });
    return str;
  }

  /**
   * @param {Object} input
   * @param {Object} param
   * @return {Array.<string>}
   * @private
   */
  _validateSchema(input, param) {
    const errors = [];
    const schema = param.schema;
    if (_.isUndefined(schema['x-validate'])) {
      return errors;
    }
    if (!_.isArray(schema['x-validate'])) {
      throw new Error('x-validate must be an array');
    }
    const value = this._getValue(input, param.name);
    schema['x-validate'].forEach((rule) => {
      let ruleName;
      let params = [];
      if (_.isObject(rule)) {
        ruleName = Object.keys(rule)[0];
        params = rule[ruleName];
      } else {
        ruleName = rule;
      }
      if (!Validator.validate(ruleName, value, ...params)) {
        errors.push(this._createErrorMessage(ruleName, param.name, ...params));
      }
    });
    return errors;
  }

  /**
   * @param {Object} body
   * @param {Object} schema
   * @return {Array.<string>}
   * @private
   */
  _validateBody(body, schema) {
    let errors = [];
    if (schema.type === 'object') {
      if (schema.properties) {
        Object.keys(schema.properties).forEach((propName) => {
          const prop = schema.properties[propName];
          if (prop.type === 'object') {
            errors = errors.concat(
                this._validateBody(body[propName] || {}, prop));
          } else if (!_.isUndefined(prop['x-validate'])) {
            const param = {
              name: propName,
              schema: {
                'x-validate': prop['x-validate'],
              },
            };
            const result = this._validateSchema(body, param);
            errors = errors.concat(result);
          }
        });
      }
    }
    return errors;
  }

  /**
   * @param {Request} req
   * @return {ApiResponse|undefined}
   */
  async execute(req) {
    const params = this.route.parameters;
    let failedFields = [];
    params.forEach((param) => {
      let errors = [];
      if (param.type === 'query') {
        errors = this._validateSchema(req.query, param);
      } else if (param.type === 'path') {
        errors = this._validateSchema(req.params, param);
      }
      if (errors.length) {
        failedFields = failedFields.concat(errors);
      }
    });
    if (this.route.requestBody) {
      let schema = null;
      if (this.route.requestBody.content) {
        const bodyType = Object.keys(this.route.requestBody.content)[0];
        if (this.route.requestBody.content[bodyType] &&
            this.route.requestBody.content[bodyType].schema) {
          schema = this.route.requestBody.content[bodyType].schema;
        }
      }
      if (schema) {
        failedFields =
          failedFields.concat(this._validateBody(req.body, schema));
      }
    }
    if (failedFields.length > 0) {
      const value = await this.eventBus
          .emit('VALIDATION_RESPONSE', failedFields);
      if (value) {
        return ApiResponse.badRequest(value);
      }
      return ApiResponse.badRequest(failedFields);
    }
  }
}

module.exports = ValidatorMiddleware;
