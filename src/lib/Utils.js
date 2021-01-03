/**
 * Utility functions
 */
class Utils {
  /**
   * @param {string} str
   * @param {*} defValue
   * @return {{}|*}
   */
  static parseJSON(str, defValue = {}) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return defValue;
    }
  }

  /**
   * @param {function} invokable
   * @param {array} [args]
   */
  static invokeAsync(invokable, ...args) {
    process.nextTick(() => {
      invokable(...args);
    });
  }

  /**
   * @param {string} str
   * @return {number}
   */
  static hashCode(str) {
    let i;
    let l;
    let hval = 0x811c9dc5; // seed
    for (i = 0, l = str.length; i < l; i++) {
      hval ^= str.charCodeAt(i);
      hval += (hval << 1) + (hval << 4) +
        (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
  }

  /**
   * Creates unique api key
   * @param {number} [length]
   * @return {Promise<string>}
   */
  static async createSecretKey(length) {
    return (await crypto.randomBytes(length || 32)).toString('hex');
  }
}

module.exports = Utils;
