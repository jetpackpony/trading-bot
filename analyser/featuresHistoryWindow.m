function [x, y] = featuresHistoryWindow(data, windowSize, ...
                          postWindowSize, topPercent, bottomPercent)

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

  curWindow = [];
  x = [];
  y = [];
  for i = 1:(size(data, 1) - postWindowSize)
    if (size(curWindow, 2) == windowSize)
      x(end+1, :) = curWindow;
      y(end+1, 1) = willPriceJump(curWindow(5), ...
                      data(i:i+postWindowSize-1, [2 3 4 5]), ...
                      topPercent, bottomPercent);
      curWindow = [curWindow(1, 2:end) data(i, 5)];
    else
      curWindow(end+1) = data(i, 5);
    endif
  endfor
endfunction
