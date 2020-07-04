const restify = require('restify');
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const _ = require('lodash');
const Store = require('node-libs-lc').Store;
const Logger = require('node-libs-lc').Logger;

/**
 * Http server
 */
class ApiServer {
  /**
   * @param {Object} routes
   * @param {{
   *   port:number,
   *   logger:{
   *     level:string,
   *     mode:string,
   *     file:?string
   *   },
   *   silent:?boolean,
   *   validation:?{
   *     enabled:boolean,
   *     templates:Object.<String, String>
   *   },
   *   paths:{
   *     controller:string,
   *     middleware:string,
   *   }
   * }} config
   */
  constructor(routes, config) {
    this._routes = routes;
    this._config = config;
    this._logger = new Logger(config.logger);
    this._paths = config.paths;
    this._store = null;
    this._cache = {
      controller: {},
      middleware: {},
    };
  }

  /**
   * @return {Server}
   * @private
   */
  _createServer() {
    return restify.createServer();
  }

  /**
   * @param {string} middlewareName
   * @param {Request} req
   * @param {Object} route
   * @param {Store} store
   * @return {Promise<ApiResponse|undefined>}
   * @private
   */
  async _executeMiddleware(middlewareName, req, route, store) {
    const Middleware = this._cache.middleware[middlewareName];
    const middleware = new Middleware(this._config, this._logger, route);
    middleware.attachRequestStore(store);
    if (this._store) {
      middleware.attachDefaultStore(this._store);
    }
    await middleware.beforeExecute();
    return middleware.execute(req);
  }

  /**
   * @param {string} controllerName
   * @param {string} method
   * @param {Request} req
   * @param {Object} route
   * @param {Store} store
   * @return {Promise<ApiResponse>}
   * @private
   */
  async _executeController(controllerName, method, req, route, store) {
    const Controller = this._cache.controller[controllerName];
    const controller = new Controller(this._config, this._logger, route);
    controller.attachRequestStore(store);
    if (this._store) {
      controller.attachDefaultStore(this._store);
    }
    await controller.beforeExecute();
    return controller[method](req);
  }

  /**
   * @param {Array.<{
   *   path:string,
   *   requestMethod:string,
   *   controller:string,
   *   method:string,
   *   operationId:string,
   *   parameters:Array.<{
   *     name:string,
   *     type:string,
   *     schema:Object
   *   }>,
   *   middleware:Array.<string>,
   * }>} routes
   * @private
   */
  _registerRoutes(routes) {
    routes.forEach((route) => {
      this._server[route.requestMethod](route.path, async (req, res) => {
        const requestStore = new Store();
        if (this._config.silent !== true) {
          await this._executeMiddleware(
              ApiServer.coreMiddlewares.logger, req, route, requestStore);
        }
        const middlewareStack = route.middleware || [];
        /**
         * @type {ApiResponse}
         */
        let response;
        if (this._config.validation && this._config.validation.enabled) {
          response = await this._executeMiddleware(
              ApiServer.coreMiddlewares.validator, req, route, requestStore);
        }
        if (_.isUndefined(response) && middlewareStack.length > 0) {
          for (let i = 0; i < middlewareStack.length; i++) {
            if (_.isUndefined(response)) {
              response = await this._executeMiddleware(
                  middlewareStack[i], req, route, requestStore);
            }
          }
        }
        if (_.isUndefined(response)) {
          response = await this._executeController(
              route.controller, route.method, req, route, requestStore);
        }
        const headers = response.getHeaders();
        for (const name in headers) {
          if (Object.hasOwnProperty.call(headers, name)) {
            res.header(name, headers[name]);
          }
        }
        res.status(response.getStatusCode());
        if (response.isTextFormat()) {
          res.send(response.buildResponse());
        }
      });
    });
  }

  /**
   * @return {Promise<void>}
   * @private
   */
  async _cacheMiddlewareStack() {
    const dirPath = this._paths.middleware;
    await this._cacheDependencies(dirPath, this._cache.middleware);
    await this._cacheDependencies(
        `${__dirname}/middleware`,
        this._cache.middleware,
    );
  }

  /**
   * @return {Promise<void>}
   * @private
   */
  async _cacheControllers() {
    const dirPath = this._paths.controller;
    await this._cacheDependencies(dirPath, this._cache.controller);
  }

  /**
   * @param {string|Array.<string>} dirPath
   * @param {Object.<string, HttpBase>} target
   * @return {Promise<void>}
   * @private
   */
  async _cacheDependencies(dirPath, target) {
    let files;
    try {
      files = await promisify(fs.readdir)(dirPath);
    } catch (e) {
      files = [];
    }
    for (let i = 0; i < files.length; i++) {
      const name = files[i].split('.')[0];
      const classPath = path.join(dirPath, files[i]);
      target[name] = require(classPath);
    }
  }

  /**
   * @param {Store} store
   */
  attachStore(store) {
    this._store = store;
  }

  /**
   * @param {string} name
   * @param {HttpBase} middlewareObj
   */
  attachMiddleware(name, middlewareObj) {
    this._cache.middleware[name] = middlewareObj;
  }

  /**
   * Lift the app
   */
  async lift() {
    this._server = this._createServer();
    this._server.use(restify.plugins.queryParser());
    this._server.use(restify.plugins.bodyParser());
    await this._cacheMiddlewareStack();
    await this._cacheControllers();
    this._registerRoutes(this._routes);
    const port = this._config.port;
    await this._server.listen(port);
    this._logger.info(`Server is up and ready on port ${port}`);
  }
}

ApiServer.coreMiddlewares = {
  logger: 'RequestLoggerMiddleware',
  validator: 'ValidatorMiddleware',
};

module.exports = ApiServer;
