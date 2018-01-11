const fs = require('fs');
const csv = require('fast-csv');

const fileName = 'test.csv';
const readFileStream = fs.createReadStream(fileName);
let prev = null;
const readCSVSteam =
  csv()
  .on("data", function(data){
    if (prev && parseInt(prev[0]) > parseInt(data[0])) {
      throw Error(`Things are out of order:
      previous: ${JSON.stringify(prev)}
      current: ${JSON.stringify(data)}`);
    }
    prev = data;
  })
  .on("end", function(){
    console.log("All good");
  });
readFileStream.pipe(readCSVSteam);

