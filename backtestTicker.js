const R = require('ramda');
const fs = require('fs');
const { getKlines, onKline } = require('./api');
const EventEmitter = require('events');

const updateKlines = (origKlines, line) => {
  return (R.last(origKlines).endTime === line.endTime)
    ? R.append(line, R.slice(0, -1, origKlines))
    : R.append(line, R.slice(1, Infinity, origKlines));
};

const lineToKline = R.compose(
  R.zipObj([
    "startTime", "open", "high", "low", "close", "volume",
    "endTime", "quoteVolume", "trades", "takerBaseAssetVolume",
    "takerQuoteAssetVolume", "ignored"
  ]),
  R.split(',')
);
const getInitialLines = R.compose(
  R.map(lineToKline),
  R.slice
);

const start =
  ({ symbol, interval, limit, emitter, fileName }) => {
    const lines = fs.readFileSync(fileName, 'utf-8').split('\n');
    console.log(`Read ${lines.length} examples from file`);

    let klines = getInitialLines(1, limit + 1, lines);
    let i = limit + 1;
    return function tick() {
      let line = lines[i];
      if (!line) {
        emitter.emit('end', { err: "End of file" });
        return false;
      }
      klines = updateKlines(klines, lineToKline(line));
      emitter.emit('data', klines);
      return i++;
    };
  };

const makeTicker =
  ({ symbol, interval, limit, fileName }) => {
    const emitter = new EventEmitter();
    emitter.start = R.partial(start, [{
      symbol, interval, limit,
      fileName, emitter
    }]);
    return emitter;
  };

module.exports = makeTicker;
