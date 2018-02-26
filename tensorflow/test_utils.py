import unittest
from utils import *
import numpy as np

def test_precision_100():
    y = np.array([1, 0, 0, 0, 1, 0, 1, 1, 1])
    pred = np.array([1, 0, 0, 0, 1, 0, 1, 1, 1])
    assert precisionRecall(y, pred) == (1, 1)

def test_precision_50():
    y =    np.array([0, 1, 0, 0, 1, 1, 1, 0, 0])
    pred = np.array([1, 0, 0, 0, 1, 0, 1, 1, 0])
    assert precisionRecall(y, pred) == (0.5, 0.5)

def test_precision_25():
    y =    np.array([0, 1, 0, 1, 0, 1, 1, 0, 0])
    pred = np.array([1, 0, 0, 0, 1, 0, 1, 1, 0])
    assert precisionRecall(y, pred) == (0.25, 0.25)

def test_precision_0():
    y =    np.array([0, 1, 0, 0, 0, 0, 0, 0, 0])
    pred = np.array([1, 0, 0, 0, 1, 0, 1, 1, 0])
    assert precisionRecall(y, pred) == (0, 0)
