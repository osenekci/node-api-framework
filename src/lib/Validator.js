const _ = require('lodash');

/**
 * Validator
 */
class Validator {
  /**
   * @param {*} args
   * @return {boolean}
   */
  static validate(...args) {
    const ruleName = args[0];
    const input = args[1];
    const argsToPass = [];
    if (args.length > 2) {
      for (let i = 2; i < args.length; i++) {
        argsToPass.push(args[i]);
      }
    }
    if (_.isUndefined(Validator.RULES[ruleName])) {
      throw new Error('Invalid rule name');
    }
    if (!_.isString(input)) {
      throw new Error('Validation can only be applied to a string');
    }
    return Validator.RULES[ruleName](input, ...argsToPass);
  }
}

Validator.RULES = {
  noEmpty: (str) => {
    return str.trim().length > 0;
  },
  equals: (str, target) => {
    return str === target;
  },
  alpha: (str) => {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(str);
  },
  alphaNumeric: (str) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(str);
  },
  bool: (str) => {
    return str === 'true' || str === 'false';
  },
  between: (str, min, max) => {
    if (str.length < min) {
      return false;
    }
    if (!_.isUndefined(max)) {
      return str.length <= max;
    }
    return true;
  },
  int(str, min, max) {
    const isInt = /^[+-]?[0-9]+$/.test(str);
    if (!isInt) {
      return false;
    }
    const num = parseInt(str);
    if (_.isNaN(num)) {
      return false;
    }
    if (!_.isUndefined(min) && num < min) {
      return false;
    }
    if (!_.isUndefined(max) && num > max) {
      return false;
    }
    return true;
  },
  email: (str) => {
    // eslint-disable-next-line max-len
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(str);
  },
  url: (str) => {
    // eslint-disable-next-line max-len
    const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;
    return regex.test(str);
  },
};

module.exports = Validator;
