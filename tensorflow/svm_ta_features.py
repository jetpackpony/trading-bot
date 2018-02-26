from sklearn import svm
from utils import *
from features import *
import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math


#DATA = '../analyser/rawData/test-sample-mixed.csv'
#DATA = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv'
#DATA = '../analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv'
DATA = '../analyser/rawData/2018-02-13_ETHBTC_1m_2_mon_.csv'
tick = 't1h'
data = pd.read_csv(DATA)
data.closeTime = pd.to_datetime(data['closeTime'], unit='ms')
data = data.set_index('closeTime')

WINDOW = 50
POST_WINDOW = 1
NORM_WINDOW = 100
WINDOW_CHANGE = 0.0
L1 = 128
D1 = 0.3
L2 = 32
D2 = 0.2
LR = 0.03
DECAY = 0.0
epochs = 15000

model_name = '{};l1{};d1{};l2{};d2{};lr{};dec{}'.format(
        tick,
        L1,
        D1,
        L2,
        D2,
        LR,
        DECAY
        )
print('Starting model {}'.format(model_name))

dtrain, dtest = splitDataset(0.8, 0.2, data)
xtrain, ytrain = taFeatures(dtrain, NORM_WINDOW, POST_WINDOW, WINDOW_CHANGE)
xtest, ytest = taFeatures(dtest, NORM_WINDOW, POST_WINDOW, WINDOW_CHANGE)

"""
slidingWindows = slidingWindowDataFrame(data, WINDOW, POST_WINDOW, WINDOW_CHANGE)
#plotData(slidingWindows, WINDOW)
xs = normalize(np.array(slidingWindows.iloc[:,0:WINDOW], dtype=np.float64))
ys = np.array(slidingWindows.output, dtype=np.int)
xtrain, xtest = splitDataset(0.8, 0.2, xs)
ytrain, ytest = splitDataset(0.8, 0.2, ys)
"""

train_pos = np.where(ytrain == 1)[0].shape[0]
train_total = ytrain.shape[0]
test_pos = np.where(ytest == 1)[0].shape[0]
test_total = ytest.shape[0]

print('Positives in training set: {:.2f}%'.format(train_pos / train_total * 100))
print('Positives in test set: {:.2f}%'.format(test_pos / test_total * 100))

clf = svm.SVC()
clf.fit(xtrain, ytrain.flatten())

train_pred = clf.predict(xtrain)
test_pred = clf.predict(xtest)

train_accuracy = get_accuracy(ytrain, train_pred)
test_accuracy  = get_accuracy(ytest, test_pred)
print('Last training accuracy: {:.2f}'.format(train_accuracy * 100))
print('Last test accuracy: {:.2f}'.format(test_accuracy * 100))

precision, recall = precisionRecall(ytest, test_pred)
print('Precision (truePos / allPos): {:.2f}%'.format(precision * 100))
print('Recall (truePos / actualPos): {:.2f}%'.format(recall * 100))

prices = np.array(data['close'].tolist())
prices = prices[-(len(test_pred) + 1):-1]

wf_prof = walkForwardProfit(prices, test_pred)
natural = naturalGrowth(prices)

print('Gained profit: {:.2f}%'.format(wf_prof * 100))
