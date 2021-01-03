const path = require('path');

module.exports = {
  logger: {
    level: 'DEBUG',
    mode: 'CONSOLE',
  },
  paths: {
    controller: path.join(__dirname, '../', 'controller'),
    middleware: path.join(__dirname, '../', 'middleware'),
  },
  port: 5000,
};
