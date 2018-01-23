function yWithGaps = getYWithGaps(y, postWindowSize)

  yWithGaps = ...
      reduce(@(list, v) reducer(postWindowSize, list, v), y, []);

endfunction

function res = anyOnesInWindow(postWindowSize, list)
  id = size(list, 1) - postWindowSize + 1;
  if (id < 1)
    id = 1;
  endif
  if (size(find(list(id:end) == 1), 1) > 0)
    res = true;
  else
    res = false;
  endif
endfunction

function res = reducer(postWindowSize, list, v)
  if (anyOnesInWindow(postWindowSize, list))
    res = [list; 0];
  else
    res = [list; v];
  end
endfunction
