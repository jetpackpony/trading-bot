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


DATA = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv'
tick = 't1m'
data = pd.read_csv(DATA)

results = []
"""
for WINDOW in [60, 120, 180, 360]:
    for POST_WINDOW in [1, 3, 5, 10, 20]:
        for L1 in [32, 64, 128]:
            for L2 in [32, 64, 128]:
                for D1 in [0.1, 0.3, 0.5]:
                    for D2 in [0.1, 0.3, 0.5]:
"""
WINDOW = 60
POST_WINDOW = 20
L1 = 128
D1 = 0.5
L2 = 32
D2 = 0.5
LR = 0.01
DECAY = 0.0

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

X, Y = slidingWindowsClosingPrice(data, WINDOW, POST_WINDOW)
xtrain, xtest = splitDataset(0.8, 0.2, X)
ytrain, ytest = splitDataset(0.8, 0.2, Y)

tensorboard = TensorBoard(
        log_dir='./logs/' + model_name,
        histogram_freq=0,
        batch_size=32)

model = Sequential()
model.add(Dense(L1, input_dim=WINDOW, activation='relu'))
model.add(Dropout(D1))
model.add(Dense(L2, activation='relu'))
model.add(Dropout(D2))
model.add(Dense(1, activation='sigmoid'))

opt = keras.optimizers.SGD(lr=LR, decay=DECAY)
model.compile(loss='binary_crossentropy',
        optimizer=opt,
        metrics=['accuracy'])

history = model.fit(xtrain, ytrain,
        epochs=100,
        batch_size=128,
        callbacks=[tensorboard],
        validation_data=[xtest, ytest],
        verbose=0
        )
print('Last training accuracy: {:.2f}' \
        .format(history.history['acc'][-1] * 100))
print('Last test accuracy: {:.2f}' \
        .format(history.history['val_acc'][-1] * 100))

model.save('{}.h5'.format(model_name))

pred_classes = (model.predict(xtest).flatten() >= 0.5).astype(int)

precision, recall = precisionRecall(ytest, pred_classes)
print('Precision (truePos / allPos): {:.2f}%' \
        .format(precision * 100))
print('Recall (truePos / actualPos): {:.2f}%' \
        .format(recall * 100))

prices = np.array(data['close'].tolist())
prices = prices[-(len(pred_classes) + 1):-1]

wf_prof = walkForwardProfit(prices, pred_classes)
natural = naturalGrowth(prices)

print('Gained profit: {:.2f}%'.format(wf_prof * 100))
print('Natural growth: {:.2f}%'.format(natural * 100))

"""
results.append({
    "model_name": model_name,
    "precision": precision,
    "recall": recall,
    "wf_prof": wf_prof,
    "natural": natural
    })

pdb.set_trace()
"""
