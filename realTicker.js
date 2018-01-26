const R = require('ramda');
const { getKlines, onKline } = require('./api');
const EventEmitter = require('events');

const updateKlines = (origKlines, line) => {
  return (R.last(origKlines).endTime === line.endTime)
    ? R.append(line, R.slice(0, -1, origKlines))
    : R.append(line, R.slice(1, Infinity, origKlines));
};

const transformations = {
  startTime: parseInt,
  open: parseFloat,
  high: parseFloat,
  low: parseFloat,
  close: parseFloat,
  volume: parseFloat,
  endTime: parseInt,
  quoteVolume: parseFloat,
  quoteAssetVolume: parseFloat,
  trades: parseInt,
  takerBaseAssetVolume: parseFloat,
  takerQuoteAssetVolume: parseFloat,
  ignored: parseInt
};
const transformValues = R.evolve(transformations);

const start =
  ({ symbol, interval, limit, emitter }) => {
    getKlines({ symbol, interval, limit })
      .then((initKlines) => {
        let klines = R.map(transformValues, initKlines);
        emitter.emit('data', { klines, final: true });
        onKline(symbol, interval, (data) => {
          klines = updateKlines(klines, transformValues(data.kline));
          emitter.emit('data', { klines, final: data.kline.final });
        });
      })
      .catch((err, data) => {
        console.log(err, data);
        emitter.emit('end', { err, data });
      });
    return () => {};
  };

const makeTicker =
  async ({ symbol, interval, limit }) => {
    const emitter = new EventEmitter();
    emitter.start = R.partial(start, [{ symbol, interval, limit, emitter }]);
    return emitter;
  };

module.exports = makeTicker;
