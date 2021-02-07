/**
 * Base class of middleware and controller
 */
class HttpBase {
  /**
   * @param {Object} config
   * @param {Logger} logger
   * @param {{
   *   path:string,
   *   requestMethod:string,
   *   controller:string,
   *   method:string,
   *   operationId:string,
   *   requestBody:Object,
   *   parameters:Array.<{
   *     name:string,
   *     type:string,
   *     schema:Object
   *   }>,
   *   middleware:Array.<string>,
   * }} route
   */
  constructor(config, logger, route) {
    this.config = config;
    this.logger = logger;
    this.route = route;
    this.store = null;
    this.requestStore = null;
    this.eventBus = null;
  }

  /**
   * @param {EventBus} eventBus
   */
  setEventBus(eventBus) {
    this.eventBus = eventBus;
  }

  /**
   * @param {Map} store
   */
  attachGlobalStore(store) {
    this.store = store;
  }

  /**
   * Attach request based temporary store to
   * share data between middleware and controller
   * @param {Map} store
   */
  attachRequestStore(store) {
    this.requestStore = store;
  }

  /**
   * Call before invocation
   */
  beforeExecute() {
    // Override in children
  }
}

module.exports = HttpBase;
