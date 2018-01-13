const R = require('ramda');
const math = require('mathjs');
const fs = require('fs');
const csv = require('fast-csv');
const readFullCSV = require('./readFullCSV');

/*
readFullCSV('analyser/theta.csv')
  .then(math.matrix)
  .then((theta) => {

  });
  */

const theta = math.matrix([
  1.369885816864489, -153.9484542845918, -152.4107754515262,
  -147.3954464161678, -144.8243060153946, -142.0841594244194,
  -122.7214529537359, -104.3674122554209, -91.03615697960352,
  -72.27872190402111, -54.56366254141429, -40.19058600461444,
  -20.06423413918282, -0.06493617688532394, 18.43102945509552,
  34.57574582749834, 50.91450504962654, 68.74543620693447,
  90.00524994452945, 110.4993553594272, 126.2592392524422,
  146.4876680538669, 162.5749662414571, 177.5450267735197,
  197.1061951363631
]);

const isGoingToGrow =
  (example) => {
    const x = math.matrix(R.prepend(1, example));
    const res = math.multiply(x, theta);
    return res >= 0;
  };

module.exports = {
  isGoingToGrow
};
