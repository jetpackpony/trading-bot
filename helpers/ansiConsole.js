const cursor = require('ansi')(process.stdout);

const eraseWrite = (str, line = 0) => {
  if (line > 0) {
    cursor.up(line);
  }
  cursor.horizontalAbsolute(0).eraseLine();
  cursor.write(str);
};
const consoleReset = () => cursor.reset();

module.exports = {
  eraseWrite, consoleReset
};
