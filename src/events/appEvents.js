const EventEmitter = require('events');

// One shared emitter for the whole app (event-driven features).
module.exports = new EventEmitter();
