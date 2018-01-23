function [precision, recall, fScore] = precisionRecall(p, a)
% p - predicted values
% a - actual values

  truePos = size(find(p(find(a == 1)) == 1), 1);
  actualPos = size(find(a == 1), 1);
  allPos = size(find(p == 1), 1);
  if (allPos > 0)
    precision = truePos / allPos;
  else
    precision = 0;
  end
  recall = truePos / actualPos;
  if (precision + recall > 0)
    fScore = 2 * precision * recall / (precision + recall);
  else
    fScore = 0;
  end

endfunction
