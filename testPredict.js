const R = require('ramda');
const math = require('mathjs');
const fs = require('fs');
const csv = require('fast-csv');
const { isGoingToGrow } = require('./predict');

const fileName = 'analyser/trainingSet.csv';
const readFileStream = fs.createReadStream(fileName);
let correct = 0;
let total = 0;
let positive = 0;
const readCSVSteam =
  csv()
  .on("data", function(data){
    let ex = R.slice(0, -1, data);
    let res = R.last(data) === '1';

    total++;
    if (res) {
      positive++;
    }
    if (isGoingToGrow(ex) === res) {
      correct++;
    }
  })
  .on("end", function(){
    console.log(`Total correct: ${correct}`);
    console.log(`Total positive: ${positive} (${positive / total * 100}%)`);
    console.log(`Total examples: ${total}`);
    console.log(`Accuracy: `,
              math.round(correct / total * 100, 2));
  });
readFileStream.pipe(readCSVSteam);

