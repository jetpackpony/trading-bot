const fs = require('fs');
const R = require('ramda');

const lines = fs.readFileSync('tensorflow/manyModels.txt', 'utf-8').split('\n');

let matches = [];
for (let line of lines) {
  matches.push(R.match(/Starting model (.+)/, line));
  matches.push(R.match(/Precision.+: (.+)%/, line));
  matches.push(R.match(/Recall.+: (.+)%/, line));
}

const calcFScore = (prec, rec) => 2 * prec * rec / (prec + rec);
const addFScore = (model) => R.merge(
  { fscore: calcFScore(model.prec, model.rec) },
  model
);
const processModel = ([name, prec, rec]) => ({
  name,
  prec: parseFloat(prec),
  rec: parseFloat(rec)
});
const formModels = R.compose(
  R.map(addFScore),
  R.map(processModel),
  R.splitEvery(3),
  R.pluck(1),
  R.reject(R.isEmpty)
);
const sortByFscore = R.compose(
  R.reverse,
  R.sortBy(R.prop('fscore'))
);

const models = sortByFscore(formModels(matches));

debugger;
