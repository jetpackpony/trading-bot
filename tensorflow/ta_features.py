from utils import *
import pdb
import tensorflow as tf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math
import talib

def collect_features(data):
    close = np.array(data['close'])
    ochlv = data[['open', 'close', 'high', 'low', 'volume']]
    """
    rsi = pd.DataFrame(talib.RSI(close, 14), columns=['rsi'])
    macd = pd.DataFrame(np.transpose(talib.MACD(close)),
                                columns=['macd', 'macdSignal', 'macdhist'])

    X = pd.concat([ochlv, rsi, macd], axis=1)
    last_nan_id = X[X.isnull().any(axis=1)].iloc[-1].name
    X = X[last_nan_id + 1:]
    """

    Y = (close < np.roll(close, -1)).astype(int)
    Y[-1] = 0
    #Y = Y[last_nan_id + 1:]

    X, Y = normalize(np.array(X)), np.array(Y)
    return X, Y
