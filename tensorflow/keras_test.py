from utils import *
from features import *
import pdb
import tensorflow as tf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math
import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.callbacks import TensorBoard


#DATA = '../analyser/rawData/test-sample-mixed.csv'
#DATA = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv'
DATA = '../analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv'
tick = 't1m'
data = pd.read_csv(DATA)
data.closeTime = pd.to_datetime(data['closeTime'], unit='ms')
data = data.set_index('closeTime')

WINDOW = 180
POST_WINDOW = 5
WINDOW_CHANGE = 0.003
L1 = 512
D1 = 0.3
L2 = 128
D2 = 0.2
LR = 1
DECAY = 0.01
epochs = 1000

model_name = '{};w{};pw{};l1{};d1{};l2{};d2{};lr{};dec{}'.format(
        tick,
        WINDOW,
        POST_WINDOW,
        L1,
        D1,
        L2,
        D2,
        LR,
        DECAY
        )
print('Starting model {}'.format(model_name))

"""
slidingWindows = slidingWindowDFOCHL(data, WINDOW, POST_WINDOW)
#plotData(slidingWindows, WINDOW)
xs = normalize(np.array(slidingWindows.iloc[:,0:WINDOW * 4], dtype=np.float64))
ys = np.array(slidingWindows.output, dtype=np.int)
xtrain, xtest = splitDataset(0.8, 0.2, xs)
ytrain, ytest = splitDataset(0.8, 0.2, ys)
#pdb.set_trace()
"""

slidingWindows = slidingWindowDataFrame(data, WINDOW, POST_WINDOW, WINDOW_CHANGE)
#plotData(slidingWindows, WINDOW)
xs = normalize(np.array(slidingWindows.iloc[:,0:WINDOW], dtype=np.float64))
ys = np.array(slidingWindows.output, dtype=np.int)
xtrain, xtest = splitDataset(0.8, 0.2, xs)
ytrain, ytest = splitDataset(0.8, 0.2, ys)

train_pos = np.where(ytrain == 1)[0].shape[0]
train_total = ytrain.shape[0]
test_pos = np.where(ytest == 1)[0].shape[0]
test_total = ytest.shape[0]

print('Positives in training set: {:.2f}%'.format(train_pos / train_total * 100))
print('Positives in test set: {:.2f}%'.format(test_pos / test_total * 100))
#pdb.set_trace()

"""
X, Y = slidingWindowsClosingPrice(data, WINDOW, POST_WINDOW)
#plotData(slidingWindows, WINDOW)
xtrain, xtest = splitDataset(0.8, 0.2, X)
ytrain, ytest = splitDataset(0.8, 0.2, Y)
pdb.set_trace()
"""

"""
tensorboard = TensorBoard(
        log_dir='./logs/' + model_name,
        histogram_freq=0,
        batch_size=32)
"""

model = Sequential()
model.add(Dense(L1, input_dim=xtrain.shape[1], activation='relu'))
model.add(Dropout(D1))
model.add(Dense(L2, activation='relu'))
model.add(Dropout(D2))
model.add(Dense(1, activation='sigmoid'))

opt = keras.optimizers.SGD(lr=LR, decay=DECAY)
model.compile(loss='binary_crossentropy',
        optimizer=opt,
        metrics=['accuracy'])

history = model.fit(xtrain, ytrain,
        epochs=epochs,
        batch_size=128,
        #callbacks=[tensorboard],
        validation_data=[xtest, ytest],
        verbose=1
        )
print('Last training accuracy: {:.2f}'.format(history.history['acc'][-1] * 100))
print('Last test accuracy: {:.2f}'.format(history.history['val_acc'][-1] * 100))
print('Positives in training set: {:.2f}%'.format(train_pos / train_total * 100))
print('Positives in test set: {:.2f}%'.format(test_pos / test_total * 100))

#model.save('{}.h5'.format(model_name))

pred_classes = (model.predict(xtest).flatten() >= 0.5).astype(int)

precision, recall = precisionRecall(ytest, pred_classes)
print('Precision (truePos / allPos): {:.2f}%'.format(precision * 100))
print('Recall (truePos / actualPos): {:.2f}%'.format(recall * 100))

prices = np.array(data['close'].tolist())
prices = prices[-(len(pred_classes) + 1):-1]

wf_prof = walkForwardProfit(prices, pred_classes)
natural = naturalGrowth(prices)

print('Gained profit: {:.2f}%'.format(wf_prof * 100))
#print('Natural growth: {:.2f}%'.format(natural * 100))

