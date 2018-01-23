const R = require('ramda');
const math = require('mathjs');
const fs = require('fs');
const csv = require('fast-csv');
const keras = require('keras-js')
const EventEmitter = require('events');

const makePredictor = () => {
  const emitter = new EventEmitter();
  emitter.predict = (data) => {
    Promise.resolve().then(() => {
      emitter.emit('prediction', data);
      emitter.emit('ready');
    })
  };
  return emitter;
};

module.exports = makePredictor;
