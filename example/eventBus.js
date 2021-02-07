const EventBus = require('../src/lib/EventBus');

function f(event, ...args) {
  if (event.getName() === 'test2') {
    event.stopPropagation();
  }
  console.log(event.getName(), 'f', args);
  return 'f value: ' + event.getName();
}

function g(event, ...args) {
  console.log(event.getName(), 'g', args);
  // This should override test1 event value
  return 'g value: ' + event.getName();
}

const bus = new EventBus();

bus.on('test1', f);
bus.on('test1', g);

bus.on('test2', f);
bus.on('test2', g);

async function execute() {
  const val1 = await bus.emit('test1', 1, 2);
  const val2 = await bus.emit('test2', 1, 2);
  console.log(val1);
  console.log(val2);
}

execute();
