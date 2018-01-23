%% Logistic Regression

%% Initialization
clear ; close all; clc
page_screen_output(0);

%% Load the data
fprintf('Reading data from file...\n');
%fflush(stdout);
%fileName = 'rawData/2018-01-12_ETHUSDT_1m_1_mon_.csv-features.csv';
%fileName = 'rawData/2018-01-12_ETHBTC_1h_4_mon_.csv';
fileName = 'rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv-features-w1440p180tp0.02bp0.01.csv';
data = csvread(fileName);

%% Extract features
tickInterval = 1;
windowSize = 1440;
postWindowSize = 180;
topPercent = 0.02;
bottomPercent = 0.01;

%data = data(2:end, :);
%[x, y] = featuresHistoryWindow(data, windowSize, ...
%                    postWindowSize, topPercent, bottomPercent);

x = data(:, 1:end-1);
y = data(:, end:end);

yWithGaps = getYWithGaps(y, postWindowSize);

totalNum = size(y, 1);
days = (totalNum * tickInterval) / (24 * 60);
positives = size(find(y == 1), 1);
posWithGaps = size(find(yWithGaps == 1), 1);
posPercent = positives / totalNum * 100;
posWithGapsPercent = posWithGaps / totalNum * 100;
dealsPerDay = posWithGaps / days;

fprintf('Features from: %s\n', fileName);
fprintf('Window size: %i\n', windowSize);
fprintf('Post-window size: %i\n', postWindowSize);
fprintf('Top Percent: %i\n', topPercent);
fprintf('Bottom Percent: %i\n', bottomPercent);
fprintf('Total examples: %i\n', totalNum);
fprintf('Pos examples: %i (%.2f%%)\n', positives, posPercent);
fprintf('Pos examples with gaps: %i (%.2f%%)\n',...
                                posWithGaps, posWithGapsPercent);
fprintf('Days in dataset: %i\n', days);
fprintf('Min avg. deals per day: %i\n', dealsPerDay);

%fprintf('Plotting data\n');
%plotData(x, y, yWithGaps, 500);

%% Normalize inputs

tmp = csvread('trainingSet.csv');
mu = tmp(1, :);
sigma = tmp(2, :);

fprintf('Got mu and sigma from trainingSet.csv\n');
xnorm = (x .- mu) ./ sigma;

%% Predict and stuff
input_layer_size  = windowSize;
hidden_layer_size = 25;   % 25 hidden units
num_labels = 1;

fprintf('Loading thetas from nnParams.csv\n\n');
nn_params = csvread('nnParams.csv');

% Obtain Theta1 and Theta2 back from nn_params
theta1 = reshape(nn_params(1:hidden_layer_size *
                (input_layer_size + 1)), ...
                 hidden_layer_size, (input_layer_size + 1));

theta2 = reshape(nn_params((1 + (hidden_layer_size *
                (input_layer_size + 1))):end), ...
                 num_labels, (hidden_layer_size + 1));

%% Check algorithm's accuracy
% Compute accuracy

[p] = nnPredict(theta1, theta2, xnorm);
accTest = mean(double(p == y)) * 100;
fprintf('Test data accuracy: %.2f%%\n', accTest);
fprintf('Pos examples: %i/%i (actual %i/%i)\n', ...
            size(find(p == 1), 1), size(p, 1), ...
            size(find(y == 1), 1), size(y, 1));

[precision, recall, fScore] = precisionRecall(p, y);
fprintf('Precision (truePos / allPos): %.2f%%\n',...
                                               precision * 100);
fprintf('Recall (truePos / actualPos): %.2f%%\n', recall * 100);
fprintf('Fscore 2 * P * R / (P + R): %.2f%%\n\n', fScore * 100);

expProfit = expectedProfit(topPercent, bottomPercent,...
                                      precision, recall);
profitPerDay = profitPerDay(size(find(p == 1), 1), ...
          size(find(y == 1), 1), dealsPerDay, expProfit);
fprintf('Expected profit per deal: %.2f%%\n', expProfit * 100);
fprintf('Expected profit per day: %.2f%%\n', profitPerDay * 100);


