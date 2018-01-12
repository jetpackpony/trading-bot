%% Logistic Regression

%% Initialization
clear ; close all; clc

%% Load the data
fprintf('Reading data from file...\n');
data = csvread('rawData/2018-01-12_ETHBTC_1h_4_mon_.csv');
data = data(2:end, :);

fprintf('Loaded %i data points\n', size(data, 1));

%% Extract features
windowSize = 24;
postWindowSize = 5;
topPercent = 5;
bottomPercent = 2;

fprintf('Begin extracting features\n');
[x y] = featuresHistoryWindow(data, windowSize, ...
                        postWindowSize, topPercent, bottomPercent);

totalNum = size(y, 1);
positives = size(find(y == 1), 1);
posPercent = positives / totalNum * 100;

fprintf('Extracted features\n');
fprintf('Total examples: %i\n', totalNum);
fprintf('Positive examples: %i (%.2f%%)\n', positives, posPercent);
fprintf('Writing training set to trainingSet.csv\n');
csvwrite('trainingSet.csv', [x y]);

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
randIds = randperm(m);

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
fprintf('training (%i), cross-validation (%i) and test (%i)\n', ...
                  size(xtrain, 1), size(xcv, 1), size(xtest, 1));

%% Train the classifier
% Initialize fitting parameters
initial_theta = zeros(n + 1, 1);

%  Set options for fminunc
options = optimset('GradObj', 'on', 'MaxIter', 400);

%  Run fminunc to obtain the optimal theta
%  This function will return theta and the cost
[theta, cost] = ...
  fminunc(@(t)(costFunction(t, xtrain, ytrain)), initial_theta, options);

fprintf('Finished training classifier\n');
fprintf('Cost at theta found by fminunc: %f\n', cost);
fprintf('Theta: \n');
fprintf(' %f \n', theta);
fprintf('Writing theta to theta.csv\n');
csvwrite('theta.csv', theta);

%% Check algorithm's accuracy
% Compute accuracy
ptrain = predict(theta, xtrain);
accTrain = mean(double(ptrain == ytrain)) * 100;
fprintf('Training data accuracy: %.2f%%\n', accTrain);

ptest = predict(theta, xtest);
accTest = mean(double(ptest == ytest)) * 100;
fprintf('Test data accuracy: %.2f%%\n', accTest);

