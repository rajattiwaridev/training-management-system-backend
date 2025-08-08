const EventEmitter = require('events');
class TrainingEmitter extends EventEmitter {}
const trainingEmitter = new TrainingEmitter();
module.exports = trainingEmitter;