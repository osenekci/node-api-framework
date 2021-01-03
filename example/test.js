const OpenApiProcessor = require('../src/lib/OpenApiProcessor');
const ApiServer = require('../src/ApiServer');
const Config = require('node-config-lc');
const path = require('path');

async function main() {
  const processor = new OpenApiProcessor([
    'api.yaml',
  ]);
  const routes = await processor.createRoutes();

  Config.create(path.join(__dirname, 'config')).then((config) => {
    new ApiServer(routes, config)
        .lift()
        .then(() => {
          // Up and ready
        });
  });
}

main();
