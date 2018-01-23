from utils import *
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
