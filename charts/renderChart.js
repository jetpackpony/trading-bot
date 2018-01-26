const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');

const template = fs.readFileSync(path.join(__dirname, 'chart.mustache'), 'utf-8');
Mustache.parse(template);

const render = (chartConfig, name, dir = '') => {
  const output = Mustache.render(template, { chartConfig: JSON.stringify(chartConfig) });
  const file = path.join(__dirname, dir, name + '.html');
  fs.writeFileSync(file, output);
  return path.join('file://', file);
};

module.exports = render;
