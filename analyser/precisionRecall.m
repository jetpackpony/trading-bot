function [precision, recall, fScore] = precisionRecall(p, a)
% p - predicted values
% a - actual values

  truePos = size(find(p(find(a == 1)) == 1), 1);
  actualPos = size(find(a == 1), 1);
  allPos = size(find(p == 1), 1);
  precision = truePos / allPos;
  recall = truePos / actualPos;
  fScore = 2 * precision * recall / (precision + recall);

endfunction
