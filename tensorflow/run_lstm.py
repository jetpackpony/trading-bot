from metrics import *
from utils import *
from data_utils import *
from plotting import *
import lstm
import pdb
import pandas as pd
import numpy as np

from keras.layers.core import Dense, Activation, Dropout
from keras.layers.recurrent import LSTM
from keras.models import Sequential

#DATAFILE = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv'
#DATAFILE = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_.csv'
DATAFILE = '../analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv'
#DATAFILE = '../analyser/rawData/2018-02-13_ETHBTC_5m_2_mon_.csv'
#DATAFILE = '../analyser/rawData/test-sample-mixed.csv'
#DATAFILE = '../analyser/rawData/test-sample-flat.csv'
#DATAFILE = '../analyser/rawData/test-sample-falling.csv'
#DATAFILE = '../analyser/rawData/2018-02-13_ETHBTC_1m_2_mon_.csv'
#DATAFILE = 'test.csv'
COLUMN_NAME = 'close'

#DATAFILE = 'shampoo-data.csv'
#COLUMN_NAME = 'Sales'
#DATAFILE = 'sinwave.csv'
#COLUMN_NAME = 'sin'

#lstm.logReturnsSetup(DATAFILE, COLUMN_NAME)
#lstm.closePriceStdNormalizedSetup(DATAFILE, COLUMN_NAME)
lstm.statefulLSTMMinMaxSetup(DATAFILE, COLUMN_NAME)

"""
WINDOW = 30
LAYERS = [128, 128]
DROPOUTS = [0.3, 0.3]
EPOCHS = 10
BATCH_SIZE = 64

fileName = DATAFILE
columnName = COLUMN_NAME
data = prepareSinglePriceMinMaxSet(fileName, columnName, WINDOW)

origPrices = data['test']['prices']
origPrices = origPrices.reshape(origPrices.shape[0], 1)
ytestDenorm = data['test']['scaler'].inverse_transform(data['test']['y'])
ytestDeDiff = diffReturnsToPrices(origPrices, ytestDenorm)
#plotPredActual(deDiff, origPrices)

#pdb.set_trace()

model, history = lstm.fit_model(
        xtrain=data['train']['x'],
        ytrain=data['train']['y'],
        layers=LAYERS,
        dropouts=DROPOUTS,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE
        )

pred = model.predict(data['test']['x'])
predDenorm = data['test']['scaler'].inverse_transform(pred)
predDeDiff = diffReturnsToPrices(origPrices, predDenorm)

plotPredActual(predDenorm, ytestDenorm)

signPercent = correctSignPercentRoll(predDeDiff, ytestDeDiff)
percentWithin5 = percentWithin(predDeDiff, ytestDeDiff, border=0.05)
RSq = RSquared(predDeDiff, ytestDeDiff)

print('Correct return sign prediction: {:.2f}%'.format(signPercent * 100))
print('Predictions within 5%: {:.2f}%'.format(percentWithin5 * 100))
print('R squared: {}'.format(RSq))
"""
