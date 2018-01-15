function [C, sigma] = chooseParams(X, y, Xval, yval,...
                          topPercent, bottomPercent, dealsPerDay)
%DATASET3PARAMS returns your choice of C and sigma for Part 3 of the exercise
%where you select the optimal (C, sigma) learning parameters to use for SVM
%with RBF kernel
%   [C, sigma] = DATASET3PARAMS(X, y, Xval, yval) returns your choice of C and
%   sigma. You should complete this function to return the optimal C and
%   sigma based on a cross-validation set.
%

% You need to return the following variables correctly.
%steps = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30];
steps = [0.01];
params = [];
errs = [];

for i = 1:length(steps)
  for j = 1:length(steps)
    id = ((i - 1) * length(steps) + j);
    tmpC = steps(i);
    tmpSigma = steps(j);
    params(id, :) = [tmpC, tmpSigma];

    fprintf('Testing C: %f, sigma: %f\n', tmpC, tmpSigma);
    fprintf('Starting %i out of %i', id, length(steps) ^ 2);
    model = svmTrain(X, y, tmpC, ...
                  @(x1, x2) gaussianKernel(x1, x2, tmpSigma));
    predictions = svmPredict(model, Xval);

    errs(id).errCV = mean(double(predictions ~= yval));
    [errs(id).precisionCV, errs(id).recallCV, ...
        errs(id).fScoreCV] = precisionRecall(predictions, yval);
    errs(id).expProfit = expectedProfit(topPercent, ...
                  bottomPercent, errs(id).precisionCV, ...
                  errs(id).recallCV);
    errs(id).profitPerDay =...
      (1 + errs(id).expProfit)...
        ^ (dealsPerDay * errs(id).recallCV) - 1;

    fprintf('CV data error: %.2f%%\n', errs(id).errCV * 100);
    fprintf('Pos examples: %i/%i (actual %i/%i)\n', ...
        size(find(predictions == 1), 1), size(predictions, 1), ...
        size(find(yval == 1), 1), size(yval, 1));
    fprintf('Precision (truePos / allPos): %.2f%%\n', ...
                              errs(id).precisionCV * 100);
    fprintf('Recall (truePos / actualPos): %.2f%%\n', ...
                              errs(id).recallCV * 100);
    fprintf('Fscore 2 * P * R / (P + R): %.2f%%\n', ...
                              errs(id).fScoreCV * 100);
    fprintf('Expected profit per deal: %.2f%%\n\n', ...
                              errs(id).expProfit * 100);
    fprintf('Expected profit per day: %.2f%%\n\n', ...
                              errs(id).profitPerDay * 100);

    keyboard;
  endfor
endfor

[m, i] = max([errs.profitPerDay]);
C = params(i, 1);
sigma = params(i, 2);
fprintf('Maximizing profit per day (id = %i) C: %.2f, sig: %.2f\n', i, C, sigma);


keyboard;

end
