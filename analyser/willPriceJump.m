function res = willPriceJump (origPrice, nextPrices, topPercent, bottomPercent)
% Returns 1 if one of the nextPrices exeeds origPrice by topPercent
%   nextPrices = [[open high low close]] - trading prices for multiple next hours

  topPrice = origPrice * (1 + topPercent / 100);
  bottomPrice = origPrice * (1 - bottomPercent / 100);
  minPrices = nextPrices(:, 3);
  maxPrices = nextPrices(:, 2);

  drops = minPrices <= bottomPrice;
  jumps = maxPrices >= topPrice;

  res = 0;
  for i = 1:size(nextPrices, 1)
    if (drops(i) == 1)
      res = 0;
      return;
    endif
    if (jumps(i) > drops(i))
      res = 1;
      return;
    endif
  endfor
endfunction
