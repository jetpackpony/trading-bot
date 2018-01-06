const cursor = require('ansi')(process.stdout);

const eraseWrite = (str) => {
  cursor.horizontalAbsolute(0).eraseLine();
  cursor.write(str);
};
const consoleReset = cursor.reset;

module.exports = {
  eraseWrite, consoleReset
};
