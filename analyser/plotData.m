function plotData(x, y, yWithGaps, n)
% n - number of examples to plot

  prices = x(1:n, size(x, 2));
  minPrice = min(prices);
  maxPrice = max(prices);

  posRes = find(y(1:n) == 1);
  fprintf('Plotting positive examples: %i\n', size(find(y(1:n) == 1), 1));
  fprintf('Plotting positive examples with gaps: %i\n', size(posRes, 1));

  close all;
  figure('Position', [50, 50, 1200, 700]);

  plot(prices, 'color', 'b');
  hold on;
  plot([posRes'; posRes'], [minPrice, maxPrice], 'color', 'r');

  hold off;

endfunction
