from utils import *
import pdb
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

"""
test = np.arange(15).reshape(5,3)
rws = rolling_window(test, 3)
"""

def read_data(file_name):
    data = pd.read_csv(file_name)
    data.closeTime = pd.to_datetime(data['closeTime'], unit='ms')
    data = data.set_index('closeTime')
    return data

def rolling_window(inp, window):
    a = inp.transpose()
    shape = a.shape[:-1] + (a.shape[-1] - window + 1, window)
    strides = a.strides + (a.strides[-1],)
    res = np.lib.stride_tricks.as_strided(a, shape=shape, strides=strides)
    return res.transpose(1, 2, 0)

def normalize(data, mu=np.array([]), sigma=np.array([])):
    if mu.shape[0] == 0 and sigma.shape[0] == 0:
        mu = np.mean(a=data, axis=1, keepdims=True)
        sigma = np.std(a=data, axis=1, keepdims=True)
    res = (data - mu) / sigma
    return res, mu, sigma

def deNormalize(data, mu, sigma):
    return data * sigma + mu

def sigmoid(x):
  return 1 / (1 + np.exp(-x))

def normalizeSigmoid(data, mu=np.array([]), sigma=np.array([])):
    norm, m, s = normalize(data, mu, sigma)
    return sigmoid(norm), m, s

def deNormalizeSigmoid(data, mu, sigma):
    denorm = np.log(data / (1 - data))
    return deNormalize(denorm, mu, sigma)

def prepareSinglePriceSet(fileName, columnName, window_size):
    data = pd.read_csv(fileName)
    dtrain, dtest = splitDataset(0.8, 0.2, data)
    xtrain, ytrain, trainMu, trainSigma = \
            prepareSinglePrice(dtrain[columnName].values, window_size)
    xtest, ytest, testMu, testSigma = \
            prepareSinglePrice(dtest[columnName].values, window_size)
    ytrain2d = ytrain[:,0,:]
    ytest2d = ytest[:,0,:]

    return {
            "train": { "x": xtrain, "y": ytrain2d, "mu": trainMu, "sigma": trainSigma },
            "test": { "x": xtest, "y": ytest2d, "mu": testMu, "sigma": testSigma },
            }

def prepareSinglePrice(prices, window_size):
    dPrices = np.reshape(prices, (prices.shape[0], 1))
    windows = rolling_window(dPrices, window_size)
    X = windows[:,:-1,:]
    Y = windows[:,-1:,:]
    Xnorm, mu, sigma = normalize(X)
    Ynorm = normalize(Y, mu, sigma)[0]
    return Xnorm, Ynorm, mu, sigma


def prepareSinglePriceMinMaxSet(fileName, columnName, window_size):
    data = pd.read_csv(fileName)
    dtrain, dtest = splitDataset(0.8, 0.2, data)
    trainPrices = dtrain[columnName].values
    testPrices  = dtest[columnName].values
    xtrain, ytrain, scaler = \
            prepareSinglePriceMinMax(trainPrices, window_size)
    xtest, ytest, scaler = \
            prepareSinglePriceMinMax(testPrices, window_size, scaler)

    return {
            "train": { "x": xtrain, "y": ytrain, "scaler": scaler, "prices": trainPrices },
            "test": { "x": xtest, "y": ytest, "scaler": scaler, "prices": testPrices },
            }

def prepareSinglePriceMinMax(prices, window_size, scaler=None):
    diffReturns = getDiffReturns(prices)
    dReturns = np.reshape(diffReturns, (diffReturns.shape[0], 1))
    windows = rolling_window(dReturns, window_size)
    X = windows[:,:-1,:]
    Y = windows[:,-1:,:]
    dims = X.shape
    X = X.reshape(dims[0] * dims[1], 1)
    Y = Y.reshape(Y.shape[0], 1)
    if scaler is None:
        scaler = MinMaxScaler(feature_range=(-1, 1))
        scaler = scaler.fit(X)
    Xnorm = scaler.transform(X)
    Ynorm = scaler.transform(Y)
    Xnorm = Xnorm.reshape(dims[0], dims[1], 1)
    return Xnorm, Ynorm, scaler

def getDiffReturns(prices):
    pricesMinusOne = np.roll(prices, 1)
    res = (prices - pricesMinusOne)
    return res[1:]

def diffReturnsToPrices(prices, rets):
    prices = prices.flatten()
    rets = rets.flatten()
    dim_diff = prices.shape[0] - rets.shape[0]
    res = rets + np.roll(prices, 1)[dim_diff:]
    res = np.pad(res, (dim_diff,0), constant_values=0, mode='constant')
    return res

def prepareLogReturnsSet(fileName, columnName, window_size):
    data = pd.read_csv(fileName)
    dtrain, dtest = splitDataset(0.8, 0.2, data)
    xtrain, ytrain, trainMu, trainSigma = \
            prepareLogReturns(dtrain[columnName].values, window_size)
    xtest, ytest, testMu, testSigma = \
            prepareLogReturns(dtest[columnName].values, window_size)
    ytrain2d = ytrain[:,0,:]
    ytest2d = ytest[:,0,:]

    return {
            "train": { "x": xtrain, "y": ytrain2d, "mu": trainMu, "sigma": trainSigma },
            "test": { "x": xtest, "y": ytest2d, "mu": testMu, "sigma": testSigma },
            }

def prepareLogReturns(prices, window_size):
    logReturns = getLogReturns(prices)
    dReturns = np.reshape(logReturns, (logReturns.shape[0], 1))
    windows = rolling_window(dReturns, window_size)
    X = windows[:,:-1,:]
    Y = windows[:,-1:,:]
    Xnorm, mu, sigma = normalizeSigmoid(X)
    Ynorm = normalizeSigmoid(Y, mu, sigma)[0]
    return Xnorm, Ynorm, mu, sigma

def getLogReturns(prices):
    pricesPlusOne = np.roll(prices, -1)
    returns = (pricesPlusOne / prices)[0:-1]
    logReturns = np.log(returns)
    return logReturns
