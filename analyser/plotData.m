function plotData(x, y, yWithGaps)

  % number of things to plot
  %n = size(x, 1);
  n = 500;
  prices = x(1:n, size(x, 2));
  minPrice = min(prices);
  maxPrice = max(prices);

  posRes = find(yWithGaps(1:n) == 1);
  fprintf('Total positive examples: %i\n', size(find(y(1:n) == 1), 1));
  fprintf('Filtered positive examples: %i\n', size(posRes, 1));

  close all;
  figure('Position', [50, 50, 1500, 900]);

  plot(prices, 'color', 'b');
  hold on;
  plot([posRes'; posRes'], [minPrice, maxPrice], 'color', 'r');

  hold off;

endfunction
