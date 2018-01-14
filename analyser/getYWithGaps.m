function yWithGaps = getYWithGaps(y, postWindowSize)

  % Remove consecutive 1s from y
  gapSize = postWindowSize;
  yWithGaps = [];
  for i = 1:size(y, 1)
    if (y(i, 1) == 1)
      if (gapSize >= postWindowSize)
        yWithGaps(i, 1) = 1;
        gapSize = 0;
      else
        yWithGaps(i, 1) = 0;
        gapSize++;
      endif
    else
      yWithGaps(i, 1) = 0;
    endif
  endfor

endfunction
