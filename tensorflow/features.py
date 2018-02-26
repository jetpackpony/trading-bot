from utils import *
import talib
import pdb
import tensorflow as tf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math

def slidingWindowsClosingPrice(data,
                               window_size,
                               post_window_size):

    close_prices = data['close'].tolist()

    X, Y = [], []
    last_id = len(close_prices) - window_size \
                                    - post_window_size + 1
    for i in range(0, last_id):
        x_i = close_prices[i:i + window_size]
        y_i = close_prices[i + window_size - 1 + post_window_size]

        if x_i[-1] < y_i:
            y_i = 1
        else:
            y_i = 0

        X.append(x_i)
        Y.append(y_i)

    X, Y = normalize(np.array(X)), np.array(Y)

    return X, Y


def slidingWindowDataFrame(data,
                            window_size,
                            post_window_size,
                            window_change
                            ):

    close_prices = data['close'].tolist()

    X, Y, time = [], [], []
    last_id = len(close_prices) - window_size \
                                    - post_window_size + 1
    for i in range(0, last_id):
        x_i = close_prices[i:i + window_size]
        y_i = close_prices[i + window_size:i + window_size + post_window_size]
        time_i = data.index[i + window_size - 1]

        if x_i[-1] * (1 + window_change) <= np.max(y_i):
            y_i = 1
        else:
            y_i = 0

        X.append(x_i)
        Y.append(y_i)
        time.append(time_i)

    X = np.array(X)
    Y = np.array(Y)[np.newaxis].transpose()
    time = np.array(time)[np.newaxis].transpose()
    res = pd.DataFrame(np.hstack((time, X, Y)))
    res = res.set_index(0)
    res = res.rename(columns={ (window_size + 1): 'output' })

    return res

def slidingWindowDFOCHL(data,
                        window_size,
                        post_window_size):

    prices = data[['close', 'open', 'high', 'low']]

    X, Y, time = [], [], []
    last_id = data.shape[0] - window_size - post_window_size + 1
    for i in range(0, last_id):
        last_close = prices.close.iloc[i + window_size - 1]
        x_i = prices.iloc[i:i + window_size].values.flatten()
        y_i = prices.close.iloc[i + window_size - 1 + post_window_size]
        time_i = data.index[i + window_size - 1]

        if last_close < y_i:
            y_i = 1
        else:
            y_i = 0

        X.append(x_i)
        Y.append(y_i)
        time.append(time_i)

    X = np.array(X)
    Y = np.array(Y)[np.newaxis].transpose()
    time = np.array(time)[np.newaxis].transpose()
    res = pd.DataFrame(np.hstack((time, X, Y)))
    res = res.set_index(0)
    res = res.rename(columns={ (window_size * 4 + 1): 'output' })

    return res

def mavgFeatures(data,
                post_window_size,
                window_change
                ):

    close_prices = data.close.values
    mavgs = []
    mavgs.append(close_prices)
    mavgs.append(talib.SMA(close_prices, timeperiod=3))
    mavgs.append(talib.SMA(close_prices, timeperiod=5))
    mavgs.append(talib.SMA(close_prices, timeperiod=8))
    mavgs.append(talib.SMA(close_prices, timeperiod=10))
    mavgs.append(talib.SMA(close_prices, timeperiod=15))
    mavgs = np.array(mavgs).transpose()[0:-post_window_size]

    Y = getOutputs(data, post_window_size, window_change)
    pdb.set_trace()
    res = np.hstack((mavgs, Y))
    res = res[~np.isnan(res).any(axis=1)]

    return res[:,:-1], res[:,-1:]

def getOutputs(data, post_window_size, window_change):
    close_prices = data.close.values
    Y = []
    time = []
    for i in range(0, close_prices.shape[0] - post_window_size):
        x_i = close_prices[i] * (1 + window_change)
        y_i = np.max(close_prices[i + 1:i + 1 + post_window_size])

        if x_i < y_i:
            Y.append(1)
        else:
            Y.append(0)

        time.append(data.index[i])

    return np.array([Y]).transpose(), pd.DataFrame(Y, index=time)

def rolling_window(a, window):
    shape = a.shape[:-1] + (a.shape[-1] - window + 1, window)
    strides = a.strides + (a.strides[-1],)
    return np.lib.stride_tricks.as_strided(a, shape=shape, strides=strides)

def normalizeWindows(windows):
    mu = np.mean(windows, axis=1, keepdims=True)[:,0,:]
    std = np.std(windows, axis=1, keepdims=True)[:,0,:]
    values = windows[:,-1,:]
    return (values - mu) / std

def getOutputsDive(data, post_window_size, window_change, interval):
    close_prices = data.close.values
    Y = []
    time = []
    for i in range(interval, close_prices.shape[0] - post_window_size - interval):
        """
        around = close_prices[i-interval:i+1+interval]
        lower = around.mean() - around.std() * 1
        """
        prev = close_prices[i-interval:i].mean()
        post = close_prices[i+1:i+1+interval].mean()
        x_i = close_prices[i]

        if x_i < prev and x_i < post:
            Y.append(1)
        else:
            Y.append(0)

        time.append(data.index[i])

    return np.array([Y]).transpose(), pd.DataFrame(Y, index=time)

def getOutputsDiveSTD(data, post_window_size, window_change, interval):
    close_prices = data.close.values
    Y = []
    time = []
    for i in range(interval, close_prices.shape[0] - post_window_size - interval):
        around = close_prices[i-interval:i+1+interval]
        lower = around.mean() - around.std() * 1
        x_i = close_prices[i]

        if x_i <= lower:
            Y.append(1)
        else:
            Y.append(0)

        time.append(data.index[i])

    return np.array([Y]).transpose(), pd.DataFrame(Y, index=time)

def taFeatures(data,
                norm_window,
                post_window_size,
                window_change
                ):

    features = getFeatures(opn=data.open.values,
                            close=data.close.values,
                            high=data.high.values,
                            low=data.low.values,
                            volume=data.volume.values)

    fClean = features[~np.isnan(features).any(axis=1)]
    timeClean = data.index[~np.isnan(features).any(axis=1)]
    windows = rolling_window(fClean.transpose(), norm_window).transpose(1, 2, 0)

    X = normalizeWindows(windows)
    timeX = timeClean[timeClean.shape[0] - X.shape[0]:]
    X = X[0:-post_window_size]
    timeX = timeX[0:-post_window_size]

    Y, yDF = getOutputsDive(data, post_window_size, window_change)
    #Y, yDF = getOutputs(data, post_window_size, window_change)
    yDF = yDF.loc[timeX]
    Y = yDF.values

    return X, Y, timeX

def taFeaturesNoNorm(data,
                norm_window,
                post_window_size,
                window_change,
                avg_interval
                ):

    features = getFeatures(opn=data.open.values,
                            close=data.close.values,
                            high=data.high.values,
                            low=data.low.values,
                            volume=data.volume.values)

    X = features[~np.isnan(features).any(axis=1)]
    X = X[avg_interval:-(post_window_size + avg_interval)]
    timeX = data.index[~np.isnan(features).any(axis=1)]
    timeX = timeX[avg_interval:-(post_window_size + avg_interval)]

    #Y, yDF = getOutputsDiveSTD(data, post_window_size, window_change, avg_interval)
    Y, yDF = getOutputs(data, post_window_size, window_change)
    yDF = yDF.loc[timeX]
    Y = yDF.values

    return X, Y, timeX

def getFeatures(opn, close, high, low, volume):
    features = []
    features.append(talib.MOM(close, timeperiod=3))
    features.append(talib.MOM(close, timeperiod=4))
    features.append(talib.MOM(close, timeperiod=5))
    features.append(talib.MOM(close, timeperiod=8))
    features.append(talib.MOM(close, timeperiod=9))
    features.append(talib.MOM(close, timeperiod=10))
    features.append(talib.MOM(close, timeperiod=15))
    features.append(talib.MOM(close, timeperiod=17))
    features.append(talib.MOM(close, timeperiod=20))
    features.append(talib.MOM(close, timeperiod=24))
    features.append(talib.MOM(close, timeperiod=30))
    features.append(talib.MOM(close, timeperiod=40))

    slowk, slowd = talib.STOCH(high, low, close, fastk_period=3)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=4)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=5)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=8)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=9)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=10)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=14)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=21)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=22)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=26)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=30)
    features.append(slowk)
    features.append(slowd)
    slowk, slowd = talib.STOCH(high, low, close, fastk_period=35)
    features.append(slowk)
    features.append(slowd)


    features.append(talib.WILLR(high, low, close, timeperiod=6))
    features.append(talib.WILLR(high, low, close, timeperiod=7))
    features.append(talib.WILLR(high, low, close, timeperiod=8))
    features.append(talib.WILLR(high, low, close, timeperiod=9))
    features.append(talib.WILLR(high, low, close, timeperiod=10))
    features.append(talib.WILLR(high, low, close, timeperiod=13))
    features.append(talib.WILLR(high, low, close, timeperiod=15))
    features.append(talib.WILLR(high, low, close, timeperiod=18))
    features.append(talib.WILLR(high, low, close, timeperiod=23))
    features.append(talib.WILLR(high, low, close, timeperiod=28))
    features.append(talib.WILLR(high, low, close, timeperiod=35))

    features.append(talib.ROC(close, timeperiod=3))
    features.append(talib.ROC(close, timeperiod=4))
    features.append(talib.ROC(close, timeperiod=5))
    features.append(talib.ROC(close, timeperiod=8))
    features.append(talib.ROC(close, timeperiod=10))
    features.append(talib.ROC(close, timeperiod=12))
    features.append(talib.ROC(close, timeperiod=13))
    features.append(talib.ROC(close, timeperiod=14))
    features.append(talib.ROC(close, timeperiod=15))
    features.append(talib.ROC(close, timeperiod=21))
    features.append(talib.ROC(close, timeperiod=23))
    features.append(talib.ROC(close, timeperiod=30))

    features.append(talib.WCLPRICE(high, low, close))

    features.append(talib.AD(high, low, close, volume))

    features.append(talib.ADOSC(high, low, close, volume, fastperiod=2, slowperiod=10))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=3, slowperiod=10))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=4, slowperiod=10))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=5, slowperiod=10))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=8, slowperiod=13))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=12, slowperiod=20))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=14, slowperiod=30))
    features.append(talib.ADOSC(high, low, close, volume, fastperiod=18, slowperiod=40))

    macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
    features.append(macd)
    features.append(macdsignal)
    features.append(macdhist)
    macd, macdsignal, macdhist = talib.MACD(close, fastperiod=8, slowperiod=16, signalperiod=9)
    features.append(macd)
    features.append(macdsignal)
    features.append(macdhist)
    macd, macdsignal, macdhist = talib.MACD(close, fastperiod=6, slowperiod=20, signalperiod=3)
    features.append(macd)
    features.append(macdsignal)
    features.append(macdhist)

    features.append(talib.CCI(high, low, close, timeperiod=5))
    features.append(talib.CCI(high, low, close, timeperiod=8))
    features.append(talib.CCI(high, low, close, timeperiod=14))
    features.append(talib.CCI(high, low, close, timeperiod=20))
    features.append(talib.CCI(high, low, close, timeperiod=30))

    upperband, middleband, lowerband = talib.BBANDS(close, timeperiod=15)
    features.append(upperband)
    features.append(middleband)
    features.append(lowerband)
    upperband, middleband, lowerband = talib.BBANDS(close, timeperiod=8)
    features.append(upperband)
    features.append(middleband)
    features.append(lowerband)
    upperband, middleband, lowerband = talib.BBANDS(close, timeperiod=24)
    features.append(upperband)
    features.append(middleband)
    features.append(lowerband)

    features.append(talib.SUM(high, timeperiod=2) / 2)
    features.append(talib.SUM(high, timeperiod=5) / 5)
    features.append(talib.SUM(high, timeperiod=7) / 7)
    features.append(talib.SUM(high, timeperiod=10) / 10)
    features.append(talib.SUM(low, timeperiod=2) / 2)
    features.append(talib.SUM(low, timeperiod=5) / 5)
    features.append(talib.SUM(low, timeperiod=7) / 7)
    features.append(talib.SUM(low, timeperiod=10) / 10)
    features.append((high + low) / 2)
    features.append(talib.ADD(
            talib.SUM(high, timeperiod=2),
            talib.SUM(low, timeperiod=2)
        ) / 4)
    features.append(talib.ADD(
            talib.SUM(high, timeperiod=5),
            talib.SUM(low, timeperiod=5)
        ) / 10)
    features.append((high + low + opn + close) / 4)

    features.append(talib.LINEARREG_SLOPE(high, timeperiod=3))
    features.append(talib.LINEARREG_SLOPE(high, timeperiod=4))
    features.append(talib.LINEARREG_SLOPE(high, timeperiod=5))
    features.append(talib.LINEARREG_SLOPE(high, timeperiod=10))
    features.append(talib.LINEARREG_SLOPE(high, timeperiod=20))
    features.append(talib.LINEARREG_SLOPE(high, timeperiod=30))

    return np.array(features).transpose()
