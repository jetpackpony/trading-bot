%% Logistic Regression

%% Initialization
clear ; close all; clc
page_screen_output(0);

%% Load the data
fprintf('Reading data from file...\n');
%fflush(stdout);
%fileName = 'rawData/2018-01-12_ETHUSDT_1m_1_mon_.csv-features.csv';
%fileName = 'rawData/2018-01-12_ETHBTC_1h_4_mon_.csv';
fileName = 'rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv-features-w1440p180tp0.02bp0.01.csv';
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
%x = [ones(m, 1) x];

% Randomize the ids
randIds = randperm(m);
%randIds = 1:m;

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

%% Setup the parameters you will use for this exercise
input_layer_size  = windowSize;
hidden_layer_size = 25;   % 25 hidden units
num_labels = 1;

%% ================ Part 6: Initializing Pameters ================
%  In this part of the exercise, you will be starting to implment a two
%  layer neural network that classifies digits. You will start by
%  implementing a function to initialize the weights of the neural network
%  (randInitializeWeights.m)

fprintf('\nInitializing Neural Network Parameters ...\n')

initial_Theta1 = randInitializeWeights(input_layer_size, hidden_layer_size);
initial_Theta2 = randInitializeWeights(hidden_layer_size, num_labels);

% Unroll parameters
initial_nn_params = [initial_Theta1(:) ; initial_Theta2(:)];

%% =================== Part 8: Training NN ===================
%  You have now implemented all the code necessary to train a neural
%  network. To train your neural network, we will now use "fmincg", which
%  is a function which works similarly to "fminunc". Recall that these
%  advanced optimizers are able to train our cost functions efficiently as
%  long as we provide them with the gradient computations.
%
fprintf('\nTraining Neural Network... \n')

%  After you have completed the assignment, change the MaxIter to a larger
%  value to see how more training helps.
options = optimset('MaxIter', 200);

%  You should also try different values of lambda
lambda = 0.1;

% Create "short hand" for the cost function to be minimized
costFunction = @(p) nnCostFunction(p, ...
                                   input_layer_size, ...
                                   hidden_layer_size, ...
                                   num_labels, ...
                                   xtrain, ytrain, lambda);

% Now, costFunction is a function that takes in only one argument (the
% neural network parameters)
[nn_params, cost] = fmincg(costFunction, initial_nn_params, options);

% Obtain Theta1 and Theta2 back from nn_params
theta1 = reshape(nn_params(1:hidden_layer_size * (input_layer_size + 1)), ...
                 hidden_layer_size, (input_layer_size + 1));

theta2 = reshape(nn_params((1 + (hidden_layer_size * (input_layer_size + 1))):end), ...
                 num_labels, (hidden_layer_size + 1));

%% ================= Part 10: Implement Predict =================
%  After training the neural network, we would like to use it to predict
%  the labels. You will now implement the "predict" function to use the
%  neural network to predict the labels of the training set. This lets
%  you compute the training set accuracy.

%% Check algorithm's accuracy
% Compute accuracy

[ptrain] = nnPredict(theta1, theta2, xtrain);
[ptest] = nnPredict(theta1, theta2, xtest);

checkAccuracy(...
              xtrain, ytrain, ptrain, ...
              xtest, ytest, ptest, ...
              topPercent, bottomPercent, ...
              dealsPerDay);


