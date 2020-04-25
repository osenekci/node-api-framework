const restify = require('restify');
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const TypeUtils = require('node-utils-lc').TypeUtils;
const Logger = require('node-libs-lc').Logger;

/**
 * Http server
 */
class ApiServer {
  /**
   * @param {string} basePath
   * @param {Config} config
   */
  constructor(basePath, config) {
    this._config = config;
    this._basePath = basePath;
    this._routes = config.get('routes');
    this._logger = new Logger(this._config.get('app.logger'));
    this._paths = config.get('app.paths');
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
   * @return {Promise<ApiResponse|undefined>}
   * @private
   */
  async _executeMiddleware(middlewareName, req, route) {
    const Middleware = this._cache.middleware[middlewareName];
    const middleware = new Middleware(this._logger, this._config, route);
    if (this._store) {
      middleware.attachStore(this._store);
    }
    await middleware.beforeExecute();
    return middleware.execute(req);
  }

  /**
   * @param {string} controllerName
   * @param {string} method
   * @param {Request} req
   * @param {Object} route
   * @return {Promise<ApiResponse>}
   * @private
   */
  async _executeController(controllerName, method, req, route) {
    const Controller = this._cache.controller[controllerName];
    const controller = new Controller(this._logger, this._config, route);
    if (this._store) {
      controller.attachStore(this._store);
    }
    await controller.beforeExecute();
    return controller[method](req);
  }

  /**
   * @param {Array.<{
   *   path:string,
   *   action:string,
   *   middleware:Array.<string>,
   *   method:string,
   *   validate:Object
   * }>} routes
   * @private
   */
  _registerRoutes(routes) {
    routes.forEach((route) => {
      this._server[route.method](route.path, async (req, res) => {
        const requestLogger = this._config.get('app.server.logger');
        if (!TypeUtils.isUndefined(requestLogger)) {
          await this._executeMiddleware(
              ApiServer.coreMiddlewares.logger, req, route);
        }
        const middlewareStack = route.middleware || [];
        /**
         * @type {ApiResponse}
         */
        let response;
        if (route.validate) {
          response = await this._executeMiddleware(
              ApiServer.coreMiddlewares.validator, req, route);
        }
        if (TypeUtils.isUndefined(response) && middlewareStack.length > 0) {
          for (let i = 0; i < middlewareStack.length; i++) {
            if (TypeUtils.isUndefined(response)) {
              response = await this._executeMiddleware(
                  middlewareStack[i], req, route);
            }
          }
        }
        if (TypeUtils.isUndefined(response)) {
          const action = route.action.split('@');
          response = await this._executeController(
              action[0], action[1], req, route);
        }
        const headers = response.getHeaders();
        for (const name in headers) {
          if (Object.hasOwnProperty.call(headers, name)) {
            res.header(name, headers[name]);
          }
        }
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
    const dirPath = path.join(this._basePath, this._paths.middleware);
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
    const dirPath = path.join(this._basePath, this._paths.controller);
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
    const port = this._config.get('app.server.port');
    await this._server.listen(port);
    this._logger.info(`Server is up and ready on port ${port}`);
  }
}

ApiServer.coreMiddlewares = {
  logger: 'RequestLoggerMiddleware',
  validator: 'ValidatorMiddleware',
};

module.exports = ApiServer;
