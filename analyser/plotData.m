function plotData(x, y)

  % number of things to plot
  %n = size(x, 1);
  n = 500;
  prices = x(1:n, size(x, 2));
  minPrice = min(prices);
  maxPrice = max(prices);

  gapSize = 5;
  filteredY = [];
  for i = 1:size(y, 1)
    if (y(i, 1) == 1)
      if (gapSize >= 5)
        filteredY(i, 1) = 1;
        gapSize = 0;
      else
        filteredY(i, 1) = 0;
        gapSize++;
      endif
    else
      filteredY(i, 1) = 0;
    endif
  endfor

  posRes = find(filteredY(1:n) == 1);
  fprintf('Total positive examples: %i\n', size(find(y(1:n) == 1), 1));
  fprintf('Filtered positive examples: %i\n', size(posRes, 1));

  close all;
  figure('Position', [50, 50, 1500, 900]);

  plot(prices, 'color', 'b');
  hold on;
  plot([posRes'; posRes'], [minPrice, maxPrice], 'color', 'r');

  hold off;

endfunction
