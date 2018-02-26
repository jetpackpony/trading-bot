from utils import *
from features import *
import pdb
import pandas as pd
from pandas.plotting import lag_plot
import numpy as np
import matplotlib.pyplot as plt
import math
from statsmodels.tsa.ar_model import AR
def normmm(data):
    mu = np.mean(a=data)
    sigma = np.std(a=data)
    return (data - mu) / sigma

#DATA = '../analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv'
DATA = '../analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv'
data = pd.read_csv(DATA)

data.openTime = pd.to_datetime(data['openTime'], unit='ms')
data = data.set_index('openTime')

prices = data[['close']]

pdb.set_trace()

"""
#lag_plot(prices, lag=25)
#pd.plotting.autocorrelation_plot(prices)

X = prices.values
train, test = splitDataset(0.995, 0.005, X)
train, test = normmm(train), normmm(test)

model = AR(train)
model_fit = model.fit()
print('Lag: %s' % model_fit.k_ar)
print('Coefficients: %s' % model_fit.params)

predictions = model_fit.predict(start=len(train), end=len(train)+len(test)-1, dynamic=False)
plt.plot(test)
plt.plot(predictions, color='red')
plt.show()

"""
