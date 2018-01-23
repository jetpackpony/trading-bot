function [x, y] = featuresHistoryWindow(data, ...
            windowSize, postWindowSize, topPercent, bottomPercent)

% Extracts features from data by specified history window.
%   data: raw prices data (mxn) from the api
%   windowSize: the number of prices to fit in history window
%   postWindowSize: the number of prices to check after the window
%   topPercent: the top border of price change
%   bottomPercent: the bottom border of price change
%
% Each example consists of N consecutive closing prices, where
% N = windowSize. The output of each example is as follows: if
% among the next postWindowSize intervals (following the example)
% the price went higher than top border before it went lower than
% lower border, the example is counted positive (y == 1). Otherwise
% the example is negative (y == 0);

  ohlcIndecies = [2 3 4 5];
  closePriceIndex = 5;

  curWindow = [];
  x = [];
  y = [];
  for i = 1:(size(data, 1) - postWindowSize + 1)
    if (size(curWindow, 2) == windowSize)
      x(end+1, :) = curWindow;
      % pass last price in a window and next postWindowSize
      % prices to compare to it
      y(end+1, 1) = willPriceJump(curWindow(windowSize), ...
                      data(i:i+postWindowSize-1, ohlcIndecies),...
                      topPercent, bottomPercent);
      curWindow = [curWindow(1, 2:end) data(i, closePriceIndex)];
    else
      curWindow(end+1) = data(i, closePriceIndex);
    endif
  endfor

endfunction
