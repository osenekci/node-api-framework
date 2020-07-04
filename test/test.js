const OpenApiProcessor = require('../lib/OpenApiProcessor');
const ApiServer = require('../lib/ApiServer');
const path = require('path');

const dir = __dirname;

async function main() {
  const processor = new OpenApiProcessor([
    'api.yaml',
  ]);
  const routes = await processor.createRoutes();
  const server = new ApiServer(routes, {
    // TODO::: add XSS sanitizer library using xss npm module
    // TODO::: Use config api here
    // TODO::: Test api.yaml with custom parameters (with doc creator)
    port: 5000,
    logger: {
      level: 'DEBUG',
      mode: 'CONSOLE',
    },
    paths: {
      controller: path.join(dir, 'controller'),
      middleware: path.join(dir, 'middleware'),
    },
    // TODO::: Use strings api here and put this into readme
    validation: {
      enabled: true,
      templates: {
        email: '{0} is not a valid email',
        noEmpty: '{0} is required',
        between: '{0} must be between {1} and {2}',
      },
    },
  });
  server.lift().then(() => {
    // Ready
  });
}

main();
