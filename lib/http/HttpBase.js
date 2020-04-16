const Strings = require('node-libs-lc').Strings;

/**
 * Base class of middleware and controller
 */
class HttpBase {
  /**
   * @param {Logger} logger
   * @param {Config} config
   * @param {{
   *   path:string,
   *   action:string,
   *   method:string,
   *   middleware:Array.<string>,
   *   validate:Object.<{
   *     body:Object.<string, Object.<string, Array.<*> | *>>,
   *     query:Object.<string, Object.<string, Array.<*> | *>>
   *   }>
   * }} route
   */
  constructor(logger, config, route) {
    this.logger = logger;
    this.config = config;
    this.route = route;
    this.strings = Strings.getInstance(config);
    this.store = null;
  }

  /**
   * @param {Store} store
   */
  attachStore(store) {
    this.store = store;
  }

  /**
   * Call before invocation
   */
  beforeExecute() {
    // Override in children
  }
}

module.exports = HttpBase;
