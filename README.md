# Node Api Framework
### Example server.js
```js
const Config = require('node-libs-lc').Config;
const ApiServer = require('./lib/ApiServer');
const EnvUtils = require('node-utils-lc').EnvUtils;
const path = require('path');
const basePath = __dirname;

Config.create(path.join(basePath, 'config'), EnvUtils.ENV_TYPES).then((config) => {
  const server = new ApiServer(basePath, config);
  server.lift().then(() => {
    // Ready
  });
});

```
### Example app.json
```json
{
  "paths": {
    "controller": "src/mvc/controller/",
    "middleware": "src/mvc/middleware/"
  },
  "server": {
    "port": 8080,
    "logger": {
      "config": {
        "level": "DEBUG",
        "mode": "CONSOLE",
        "file": "access.log"
      }
    }
  },
  "logger": {
    "level": "DEBUG",
    "mode": "CONSOLE",
    "file": "app.log"
  }
}
```

### Example routes.json
```json
[
  {
    "path": "/test",
    "action": "TestController@test",
    "method": "get",
    "validate": {
      "query": {
        "username": {
          "required": [true],
          "min": [8]
        }
      },
      "body": {
        "username": {
          "required": [true],
          "min": [8]
        }
      }
    }
  }
]
```
