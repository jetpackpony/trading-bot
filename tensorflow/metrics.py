import pdb
import numpy as np
from sklearn.metrics import r2_score

def correctSignPercent(pred, y):
    correctNum = np.where(np.sign(y) == np.sign(pred))[0].shape[0]
    res = correctNum / pred.shape[0]
    return res

def correctSignPercentRoll(pred, y):
    prev_y = np.roll(y, 1)
    actualSign = (y > prev_y).astype(int)[1:]
    predSign = (pred > prev_y).astype(int)[1:]
    res = np.where(actualSign == predSign)[0].shape[0] / actualSign.shape[0]
    return res

def percentWithin(pred, y, border=0.05):
    withinBorderNum = np.where(np.absolute(pred / y - 1) < border)[0].shape[0]
    res = withinBorderNum / pred.shape[0]
    return res

def RSquared(pred, y):
    res = r2_score(y.flatten(), pred.flatten())
    return res

"""
def signPrecision

def signRecall
"""
