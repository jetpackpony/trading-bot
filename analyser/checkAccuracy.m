function checkAccuracy(xtrain, ytrain, xtest, ytest, xcv, ycv, ...
                                theta, topPercent, bottomPercent)

% Compute accuracy
ptrain = logRegPredict(theta, xtrain);
accTrain = mean(double(ptrain == ytrain)) * 100;
fprintf('Training data accuracy: %.2f%%\n', accTrain);
fprintf('Pos examples: %i/%i (actual %i/%i)\n', ...
            size(find(ptrain == 1), 1), size(ptrain, 1), ...
            size(find(ytrain == 1), 1), size(ytrain, 1));

[precision, recall, fScore] = precisionRecall(ptrain, ytrain);
fprintf('Precision (truePos / allPos): %.2f%%\n', precision * 100);
fprintf('Recall (truePos / actualPos): %.2f%%\n', recall * 100);
fprintf('Fscore 2 * P * R / (P + R): %.2f%%\n\n', fScore * 100);

ptest = logRegPredict(theta, xtest);
accTest = mean(double(ptest == ytest)) * 100;
fprintf('Test data accuracy: %.2f%%\n', accTest);
fprintf('Pos examples: %i/%i (actual %i/%i)\n', ...
            size(find(ptest == 1), 1), size(ptest, 1), ...
            size(find(ytest == 1), 1), size(ytest, 1));

[precision, recall, fScore] = precisionRecall(ptest, ytest);
fprintf('Precision (truePos / allPos): %.2f%%\n', precision * 100);
fprintf('Recall (truePos / actualPos): %.2f%%\n', recall * 100);
fprintf('Fscore 2 * P * R / (P + R): %.2f%%\n\n', fScore * 100);

expProfit = expectedProfit(topPercent, bottomPercent, ...
                                        precision, recall);
fprintf('Expected profit per deal: %.2f%%\n', expProfit * 100);


endfunction
