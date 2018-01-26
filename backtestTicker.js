const R = require('ramda');
const fs = require('fs');
const { getKlines, onKline } = require('./api');
const EventEmitter = require('events');

const rotateKlines = (origKlines, line) => {
  return (R.last(origKlines).endTime === line.endTime)
    ? R.append(line, R.slice(0, -1, origKlines))
    : R.append(line, R.slice(1, Infinity, origKlines));
};

const updateKlinesOrig = R.curry((limit, origKlines, line) => {
  return (origKlines.length === limit)
    ? rotateKlines(origKlines, line)
    : R.append(line, origKlines);
});

const transformations = {
  startTime: parseInt,
  open: parseFloat,
  high: parseFloat,
  low: parseFloat,
  close: parseFloat,
  volume: parseFloat,
  endTime: parseInt,
  quoteVolume: parseFloat,
  trades: parseInt,
  takerBaseAssetVolume: parseFloat,
  takerQuoteAssetVolume: parseFloat,
  ignored: parseInt
};
const transformValues = R.evolve(transformations);
const lineToKline = R.compose(
  transformValues,
  R.zipObj([
    "startTime", "open", "high", "low", "close", "volume",
    "endTime", "quoteVolume", "trades", "takerBaseAssetVolume",
    "takerQuoteAssetVolume", "ignored"
  ]),
  R.split(',')
);
const prepareLines = R.compose(
  R.slice(1, -1),
  R.split('\n')
);

const start =
  async ({ symbol, interval, limit, emitter, fileName }, onData) => {
    const updateKlines = updateKlinesOrig(limit);
    const lines = prepareLines(fs.readFileSync(fileName, 'utf-8'));
    //console.log(`Read ${lines.length} examples from file`);

    let klines = [];
    for (let line of lines) {
      klines = updateKlines(klines, lineToKline(line));
      if (klines.length >= limit) {
        await onData({ klines, final: true });
      }
    }
  };

const makeTicker =
  async ({ limit, fileName }) => {
    return {
      start: R.partial(start, [{ limit, fileName }])
    };
  };

module.exports = makeTicker;
