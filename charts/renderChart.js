const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');

const template = fs.readFileSync(path.join(__dirname, 'chart.mustache'), 'utf-8');
Mustache.parse(template);

const render = (chartData, chartLayout, name, dir = '') => {
  const output = Mustache.render(template, {
    chartData: JSON.stringify(chartData),
    chartLayout: JSON.stringify(chartLayout),
  });
  const file = path.join(__dirname, dir, name + '.html');
  fs.writeFileSync(file, output);
  return path.join('file://', file);
};

module.exports = render;
