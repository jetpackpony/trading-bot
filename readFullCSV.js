const fs = require('fs');
const csv = require('fast-csv');

const readFullCSV =
  (filename) => {
    return new Promise((resolve, reject) => {
      let content = [];
      const readFileStream = fs.createReadStream(filename);
      const readCSVSteam =
        csv()
        .on("data", function(data){
          content.push(data);
        })
        .on("end", function(){
          resolve(content);
        });
      readFileStream.pipe(readCSVSteam);
    });
  };

module.exports = readFullCSV;
