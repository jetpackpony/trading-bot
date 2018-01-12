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

