%% Logistic Regression

%% Initialization
clear ; close all; clc
page_screen_output(0);

%% Load the data
fprintf('Reading data from file...\n');
%fflush(stdout);
%fileName = 'rawData/2018-01-12_ETHUSDT_1m_1_mon_.csv-features.csv';
%fileName = 'rawData/2018-01-12_ETHBTC_1h_4_mon_.csv';
fileName = 'rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_7k.csv-features.csv';
data = csvread(fileName);

%% Extract features
tickInterval = 1;
windowSize = 600;
postWindowSize = 60;
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

%% Add polynomial features

% THis is only for logistic regression
%x = polyFeatures(x, 5);

%% Normalize inputs

[x, mu, sigma] = featureNormalize(x);

fprintf('Writing mu and sigma to normParams.csv\n');
csvwrite('trainingSet.csv', [mu; sigma]);

%fprintf('\nProgram paused. Press enter to continue.\n');
%pause;

%% Break into training, CV and test sets
trainingSize = 0.7;
cvSize = 0.15;
testSize = 0.15;

% Add intercept term to x
[m, n] = size(x);
x = [ones(m, 1) x];

% Randomize the ids
%randIds = randperm(m);
randIds = 1:m;

% Calculate the number of ids for each set
trainNum = floor(size(randIds, 2) * trainingSize);
cvNum = floor(size(randIds, 2) * cvSize);
testSize = size(randIds, 2) - trainNum - cvNum;

% Extract sets from data set
xtrain = x(randIds(1, 1:trainNum), :);
ytrain = y(randIds(1, 1:trainNum), :);
xcv = x(randIds(1, (trainNum + 1):(trainNum + cvNum)), :);
ycv = y(randIds(1, (trainNum + 1):(trainNum + cvNum)), :);
xtest = x(randIds(1, (trainNum + cvNum + 1):end), :);
ytest = y(randIds(1, (trainNum + cvNum + 1):end), :);

fprintf('Braking data into 3 sets: ');
fprintf('train (%i), cv (%i) and test (%i)\n', ...
          size(xtrain, 1), size(xcv, 1), size(xtest, 1));

%% Train the classifier

%C = 3; sigma = 1;
[C, sigma] = chooseParams(xtrain, ytrain, xcv, ycv, ...
                      topPercent, bottomPercent, dealsPerDay);
fprintf('Selected params C: %.2f, sigma: %.2f\n', C, sigma);
%model= svmTrain(xtrain, ytrain, C,...
%                  @(x1, x2) gaussianKernel(x1, x2, sigma));

model = svmtrain(ytrain, xtrain, ...
                sprintf('-c %f -g %f -q', C, sigma));


fprintf('Writing model to svmModel.mat\n\n');
save 'svmModel.mat' C, sigma, model;

%C = 1;
%model = svmTrain(x, y, C, @linearKernel, 1e-3, 20);
%load 'svmModel.mat';


%% Check algorithm's accuracy
% Compute accuracy

%checkAccuracy(xtrain, ytrain, xtest, ytest, xcv, ycv, ...
%                            theta, topPercent, bottomPercent);

% Compute accuracy
[ptrain] = svmpredict(ytrain, xtrain, model, '-q');
accTrain = mean(double(ptrain == ytrain)) * 100;
fprintf('Training data accuracy: %.2f%%\n', accTrain);
fprintf('Pos examples: %i/%i (actual %i/%i)\n', ...
            size(find(ptrain == 1), 1), size(ptrain, 1), ...
            size(find(ytrain == 1), 1), size(ytrain, 1));

[precision, recall, fScore] = precisionRecall(ptrain, ytrain);
fprintf('Precision (truePos / allPos): %.2f%%\n', ...
                                               precision * 100);
fprintf('Recall (truePos / actualPos): %.2f%%\n', recall * 100);
fprintf('Fscore 2 * P * R / (P + R): %.2f%%\n\n', fScore * 100);

[ptest] = svmpredict(ytest, xtest, model, '-q');
accTest = mean(double(ptest == ytest)) * 100;
fprintf('Test data accuracy: %.2f%%\n', accTest);
fprintf('Pos examples: %i/%i (actual %i/%i)\n', ...
            size(find(ptest == 1), 1), size(ptest, 1), ...
            size(find(ytest == 1), 1), size(ytest, 1));

[precision, recall, fScore] = precisionRecall(ptest, ytest);
fprintf('Precision (truePos / allPos): %.2f%%\n',...
                                               precision * 100);
fprintf('Recall (truePos / actualPos): %.2f%%\n', recall * 100);
fprintf('Fscore 2 * P * R / (P + R): %.2f%%\n\n', fScore * 100);

expProfit = expectedProfit(topPercent, bottomPercent,...
                                      precision, recall);
profitPerDay = profitPerDay(size(find(ptest == 1), 1), ...
          size(find(ytest == 1), 1), dealsPerDay, expProfit);
fprintf('Expected profit per deal: %.2f%%\n', expProfit * 100);
fprintf('Expected profit per day: %.2f%%\n', profitPerDay * 100);

keyboard;
