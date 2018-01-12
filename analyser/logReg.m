%% Logistic Regression

%% Initialization
clear ; close all; clc

%% Load the data
data = csvread('test.csv');
data = data(2:end, :);

%% Extract features
windowSize = 5;
postWindowSize = 5;
topPercent = 3;
bottomPercent = 1;

[x y] = featuresHistoryWindow(data, windowSize, ...
                        postWindowSize, topPercent, bottomPercent);

totalNum = size(y, 1);
positives = size(find(y == 1), 1);
posPercent = positives / totalNum * 100;

fprintf('Extracted features\n');
fprintf('Total examples: %i\n', totalNum);
fprintf('Positive examples: %i (%.2f%%)\n', positives, posPercent);

%% Break into training, CV and test sets

trainingSize = 0.7;
cvSize = 0.15;
testSize = 0.15;

randIds = randperm(size(x, 1));

trainNum = floor(size(randIds, 2) * trainingSize);
cvNum = floor(size(randIds, 2) * cvSize);
testSize = size(randIds, 2) - trainNum - cvNum;

xtrain = x(randIds(1, 1:trainNum), :);
xcv = x(randIds(1, (trainNum + 1):(trainNum + cvNum)), :);
xtest = x(randIds(1, (trainNum + cvNum + 1):end), :);

