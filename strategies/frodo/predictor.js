const R = require('ramda');
const math = require('mathjs');
const fs = require('fs');
const csv = require('fast-csv');
const keras = require('keras-js')
const EventEmitter = require('events');

const normalize = (input) => {
  const mu = math.mean(input);
  const sigma = math.std(input);
  return input.map((i) => (i - mu) / sigma);
};

const initModel = () => {
  const model = new keras.Model({
    filepath: 'tensorflow/t1m;w60;pw20;l1128;d10.5;l232;d20.5;lr0.01;dec0.0.bin',
    filesystem: true
  });

  return model
    .ready()
    .then(() => {
      return function isGoingToGrow(input) {
        return model
          .predict({
            input: new Float32Array(normalize(input))
          })
          .then((res) => {
            return res.output[0].valueOf() >= 0.5
          })
      };
    });
};

const makePredictor = async () => {
  const isGoingToGrow = await initModel();

  return {
    predict: async (klines) => {
      const pred = await isGoingToGrow(R.pluck('close')(klines));
      return {
        trend: (pred) ? 'up' : 'down',
        price: R.last(klines).close,
        time: R.last(klines).endTime
      };
    }
  }
};

module.exports = makePredictor;
