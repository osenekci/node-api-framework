const _ = require('lodash');
const SwaggerParser = require('swagger-parser');

/**
 * Parse api.yaml and prepare routes
 */
class OpenApiProcessor {
  /**
   * @param {Array.<string>} files
   */
  constructor(files) {
    this._files = files;
  }

  /**
   * @return {Promise<[Object]>}
   */
  async createRoutes() {
    try {
      let routes = [];
      for (let i = 0; i < this._files.length; i++) {
        const file = this._files[i];
        const content = await SwaggerParser.validate(file);
        const paths = content.paths;
        Object.keys(paths).forEach((path) => {
          const readyPath = this._convertPathParams(path);
          const pathRoutes =
              this._createRoutesFromDefinition(readyPath, paths[path]);
          routes = routes.concat(pathRoutes);
        });
      }
      return routes;
    } catch (e) {
      console.error(e);
      throw new Error('Api yaml validation failed');
    }
  }

  /**
   * @param {string} path
   * @return {string}
   * @private
   */
  _convertPathParams(path) {
    if (path.indexOf('{') >= 0) {
      const parts = [];
      path.split('/').forEach((part) => {
        if (_.startsWith(part, '{') && _.endsWith(part, '}')) {
          const replaced = part.replace('{', ':').replace('}', '');
          parts.push(replaced);
        } else {
          parts.push(part);
        }
      });
      return parts.join('/');
    }
    return path;
  }

  /**
   * @param {String} path
   * @param {Object} definition
   * @return {Object}
   * @private
   */
  _createRoutesFromDefinition(path, definition) {
    const routes = [];
    Object.keys(definition).forEach((method) => {
      // Convert delete into restify del method
      const requestMethod = method === 'delete' ? 'del' : method;
      const methodDefinition = definition[method];
      if (!_.isString(methodDefinition['x-action'])) {
        throw new Error(`Undefined x-action field for ${method}:${path}`);
      }
      const action = methodDefinition['x-action'].split('@');
      if (action.length !== 2) {
        // eslint-disable-next-line max-len
        throw new Error(`Unexpected value ${action.join('@')} of x-action field for ${method}:${path}`);
      }
      const route = {
        path: path,
        requestMethod: requestMethod,
        controller: action[0],
        method: action[1],
        operationId: methodDefinition.operationId,
        parameters: [],
        middleware: [],
        requestBody: null,
      };
      if (!_.isUndefined(methodDefinition['x-middleware'])) {
        if (!_.isArray(methodDefinition['x-middleware'])) {
          throw new Error(`Unexpected x-action value for ${method}:${path}`);
        }
        route.middleware = methodDefinition['x-middleware'];
      }
      if (methodDefinition.parameters) {
        route.parameters = this._processParameters(methodDefinition.parameters);
      }
      if (methodDefinition.requestBody) {
        route.requestBody = methodDefinition.requestBody;
      }
      routes.push(route);
    });
    return routes;
  }

  /**
   * @param {Array.<{
   *  name:string,
   *  in:string,
   *  schema:Object
   * }>} params
   * @return {Array.<{
   *   name:string,
   *   type:string,
   *   schema:Object
   * }>}
   * @private
   */
  _processParameters(params) {
    const parameters = [];
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      parameters.push({
        name: param.name,
        type: param.in,
        schema: param.schema || null,
      });
    }
    return parameters;
  }
}

module.exports = OpenApiProcessor;
