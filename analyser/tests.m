%% Tests for various functions

%% willPriceJump
windowSize = 5;
postWindowSize = 5;
topPercent = 5;
bottomPercent = 2;

% Price goes above topPercent
nextPrices = [
  100.00 103.05 98.01 102.00;
  100.00 105.05 99.00 102.00;
  100.00 101.00 99.99 102.00;
];
res = willPriceJump (100.00, nextPrices, topPercent, bottomPercent);
if (res == 1)
  fprintf('.');
else
  fprintf('\nPrice goes above, result should be 1\n');
endif

% Price goes above topPercent, then below bottomPercent
nextPrices = [
  100.00 103.05 98.01 102.00;
  100.00 105.05 99.00 102.00;
  100.00 101.00 99.99 102.00;
  100.00 102.00 97.99 102.00;
];
res = willPriceJump (100.00, nextPrices, topPercent, bottomPercent);
if (res == 1)
  fprintf('.');
else
  fprintf('\nPrice goes above topPercent, then below bottomPercent, result should be 1\n');
endif

% Price goes blow bottomPercent, then above topPercent
nextPrices = [
  100.00 103.05 98.01 102.00;
  100.00 102.00 97.99 102.00;
  100.00 101.00 99.99 102.00;
  100.00 105.05 99.00 102.00;
];
res = willPriceJump (100.00, nextPrices, topPercent, bottomPercent);
if (res == 0)
  fprintf('.');
else
  fprintf('\nPrice goes blow bottomPercent, then above topPercent, result should be 0\n');
endif

% Price stagnates between top and bottom
nextPrices = [
  100.00 103.05 98.01 102.00;
  100.00 102.00 98.99 102.00;
  100.00 101.00 99.99 102.00;
  100.00 104.05 99.00 102.00;
];
res = willPriceJump (100.00, nextPrices, topPercent, bottomPercent);
if (res == 0)
  fprintf('.');
else
  fprintf('\nPrice stagnates between top and bottom, result should be 0\n');
endif

% Price goes below bottomPercent
nextPrices = [
  100.00 103.05 98.01 102.00;
  100.00 102.00 93.99 102.00;
  100.00 101.00 99.99 102.00;
];
res = willPriceJump (100.00, nextPrices, topPercent, bottomPercent);
if (res == 0)
  fprintf('.');
else
  fprintf('\nPrice goes below bottomPercent, result should be 0\n');
endif

fprintf('\nDone!\n');
