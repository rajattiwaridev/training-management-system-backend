const EventEmitter = require('events');

// Training Event Emitter
class TrainingEmitter extends EventEmitter {}
const trainingEmitter = new TrainingEmitter();

// Employee Event Emitter
class EmployeeEmitter extends EventEmitter {}
const employeeEmitter = new EmployeeEmitter();

module.exports = {
  trainingEmitter,
  employeeEmitter
};