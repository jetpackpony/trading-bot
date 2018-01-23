function res = willPriceJump (origPrice, nextPrices, ...
                                  topPercent, bottomPercent)
% Returns 1 if one of the nextPrices exeeds
% origPrice by topPercent
%   nextPrices = [[open high low close]] - trading prices
%                              for multiple next hours

  topPrice = origPrice * (1 + topPercent);
  bottomPrice = origPrice * (1 - bottomPercent);
  minPrices = nextPrices(:, 3);
  maxPrices = nextPrices(:, 2);

  drops = minPrices <= bottomPrice;
  jumps = maxPrices >= topPrice;

  res = 0;
  ind = jumps - drops * 2;
  firstJump = find(ind > 0);
  firstDrop = find(ind < 0);
  if (firstJump)
    firstJump = firstJump(1, 1);
    if (firstDrop)
      firstDrop = firstDrop(1, 1);
      if (firstJump < firstDrop)
        res = 1;
      endif
    else
      res = 1;
    endif
  endif

endfunction
