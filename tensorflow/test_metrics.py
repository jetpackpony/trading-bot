from metrics import *
import numpy as np

def test_correctSignPercent():
    pred = np.array([-1.2,  1.2, -1.2, -1.2, 1.2,  1.2, -1.2,  1.2,  1.2, 1.2])
    y =    np.array([ 3.1, -3.1, -3.1, -3.1, 3.1, -3.1,  3.1, -3.1, -3.1, 3.1])
    pred = pred.reshape(pred.size, 1)
    y = y.reshape(y.size, 1)
    res = 0.4
    assert correctSignPercent(pred, y) == res

def test_percentWithin():
    pred = np.array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    y =    np.array([1.02, 1.8, 0.7, 0.99, 0.96, 1.5, 2.3, 1.001, 1.1, 0.998])
    pred = pred.reshape(pred.size, 1)
    y = y.reshape(y.size, 1)
    res = 0.5
    assert percentWithin(pred, y, 0.05) == res

def test_correctSignPercentRoll():
    y =    np.array([3, 5, 4, 6, 7, 6, 3, 2, 6, 7, 8])
#y =    np.array([3, 5, 4, 6, 7, 6, 3, 2, 6, 7])
    pred = np.array([0, 5, 6, 6, 5, 5, 7, 2, 5, 5, 6])
    pred = pred.reshape(pred.size, 1)
    y = y.reshape(y.size, 1)
    res = 0.5
    assert correctSignPercentRoll(pred, y) == res

