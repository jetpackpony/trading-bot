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




%% featuresHistoryWindow
windowSize = 2;
postWindowSize = 2;
topPercent = 2;
bottomPercent = 1;
% data is openTime and then OHLC columns
data = [
  0 101 101 101 101;
  0 102 102 102 102;
  0 103 103 103 103;
  0 100 101 99 104;
  0 105 110 105 105;
  0 106 106 106 106
];

[x, y, yWithGaps] = featuresHistoryWindow(data, ...
          windowSize, postWindowSize, topPercent, bottomPercent);

if (size(x, 1) == 3)
  fprintf('.');
else
  fprintf('\nShould have 3 windows\n');
endif

if (y(1, 1) == 0)
  fprintf('.');
else
  fprintf('\nFirst result should be 0\n');
endif

if (y(2, 1) == 0)
  fprintf('.');
else
  fprintf('\nSecond result should be 0\n');
endif

if (y(3, 1) == 1)
  fprintf('.');
else
  fprintf('\nThird result should be 1\n');
endif

fprintf('\nDone!\n');
