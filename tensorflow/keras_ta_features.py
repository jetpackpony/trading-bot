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
from keras.layers import Dense, Dropout, GaussianNoise
from keras.callbacks import TensorBoard
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

#DATA = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv'
#DATA = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_.csv'
#DATA = '../analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv'
#DATA = '../analyser/rawData/2018-02-13_ETHBTC_5m_2_mon_.csv'
#DATA = '../analyser/rawData/test-sample-mixed.csv'
#DATA = '../analyser/rawData/test-sample-flat.csv'
DATA = '../analyser/rawData/test-sample-falling.csv'
#DATA = '../analyser/rawData/2018-02-13_ETHBTC_1m_2_mon_.csv'

tick = 't5m'
data = pd.read_csv(DATA)
data.closeTime = pd.to_datetime(data['closeTime'], unit='ms')
data = data.set_index('closeTime')

NORM_WINDOW = 100
POST_WINDOW = 1
WINDOW_CHANGE = 0.0
L1 = 256
D1 = 0.5
L2 = 128
D2 = 0.5
LR = 0.1
DECAY = 1e-6
epochs = 10
AVG_INTERVAL = 100

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
#xtrain, ytrain, timetrain = taFeatures(dtrain, NORM_WINDOW, POST_WINDOW, WINDOW_CHANGE)
#xtest, ytest, timetest = taFeatures(dtest, NORM_WINDOW, POST_WINDOW, WINDOW_CHANGE)
xtrain, ytrain, timetrain = taFeaturesNoNorm(dtrain,
        NORM_WINDOW, POST_WINDOW, WINDOW_CHANGE, AVG_INTERVAL)
xtest, ytest, timetest = taFeaturesNoNorm(dtest,
        NORM_WINDOW, POST_WINDOW, WINDOW_CHANGE, AVG_INTERVAL)

#plotDataNew(dtrain, ytrain, POST_WINDOW, timetrain)
#pdb.set_trace()

scaler = StandardScaler()
scaler.fit(xtrain)
xtrain = scaler.transform(xtrain)
xtest = scaler.transform(xtest)

pca = PCA(n_components=40)
xtrain = pca.fit_transform(xtrain)
xtest = pca.transform(xtest)

train_pos = np.where(ytrain == 1)[0].shape[0]
train_total = ytrain.shape[0]
test_pos = np.where(ytest == 1)[0].shape[0]
test_total = ytest.shape[0]

print('Positives in training set: {:.2f}%'.format(train_pos / train_total * 100))
print('Positives in test set: {:.2f}%'.format(test_pos / test_total * 100))

#pdb.set_trace()

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
print('Positives in training set: {:.2f}%'.format(train_pos / train_total * 100))
print('Positives in test set: {:.2f}%'.format(test_pos / test_total * 100))
print('Last training accuracy: {:.2f}'.format(history.history['acc'][-1] * 100))
print('Last test accuracy: {:.2f}'.format(history.history['val_acc'][-1] * 100))


pred_classes = (model.predict(xtest).flatten() >= 0.5).astype(int)

#plotDataWithPredictions(dtest, ytest, pred_classes, POST_WINDOW, timetest)

precision, recall = precisionRecall(ytest, pred_classes)
print('Precision (truePos / allPos): {:.2f}%'.format(precision * 100))
print('Recall (truePos / actualPos): {:.2f}%'.format(recall * 100))

prices = np.array(data['close'].tolist())
prices = prices[-(len(pred_classes) + 1):-1]

compound_prof, sum_prof, num_deals, num_intervals = walkForwardProfit_noLosses(prices, pred_classes)
natural = naturalGrowth(prices)

print('Number of deals: {}'.format(num_deals))
print('Number of intervals: {}'.format(num_intervals))
print('Sum profit: {:.2f}%'.format(sum_prof * 100))
print('Compound profit: {:.2f}%'.format(compound_prof * 100))
print('Buy-and-hold: {:.2f}%'.format(natural * 100))

#print('Saving model: {}.h5'.format(model_name))
#model.save('{}.h5'.format(model_name))
