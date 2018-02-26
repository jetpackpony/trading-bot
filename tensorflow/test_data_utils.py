from data_utils import *
import numpy as np

def test_normalize():
    a = np.arange(15).reshape(5,3)
    res = np.array([[-1.22474487,  0.        ,  1.22474487],
                    [-1.22474487,  0.        ,  1.22474487],
                    [-1.22474487,  0.        ,  1.22474487],
                    [-1.22474487,  0.        ,  1.22474487],
                    [-1.22474487,  0.        ,  1.22474487]])
    assert np.allclose(normalize(a)[0], res)

def test_deNormalize():
    a = np.arange(15).reshape(5,3)
    norm, mu, sigma = normalize(a)
    denorm = deNormalize(norm, mu, sigma)
    assert np.allclose(denorm, a)

def test_normalizeSigmoid():
    a = np.arange(15).reshape(5,3)
    norm = normalizeSigmoid(a)[0]
    res = np.array([[0.22710252, 0.5       , 0.77289748],
                   [0.22710252, 0.5       , 0.77289748],
                   [0.22710252, 0.5       , 0.77289748],
                   [0.22710252, 0.5       , 0.77289748],
                   [0.22710252, 0.5       , 0.77289748]])
    assert np.allclose(norm, res)

def test_deNormalizeSigmoid():
    a = np.arange(15).reshape(5,3)
    norm, mu, sigma = normalizeSigmoid(a)
    denorm = deNormalizeSigmoid(norm, mu, sigma)
    assert np.allclose(denorm, a)

def test_getDiffReturns():
    prices = np.array([3, 5, 4, 6, 7, 6, 3, 2, 6, 7, 8]).reshape(11, 1)
    ret = getDiffReturns(prices)
    res = np.array([0, 2, -1, 2, 1, -1, -3, -1, 4, 1, 1]).reshape(11, 1)
    assert np.array_equal(res, ret)

def test_getDiffReturns():
    prices = np.array([3, 5, 4, 6, 7, 6, 3, 2, 6, 7, 8]).reshape(11, 1)
    ret = getDiffReturns(prices)
    reverse = diffReturnsToPrices(prices, ret)
    assert np.array_equal(reverse, prices[1:])


