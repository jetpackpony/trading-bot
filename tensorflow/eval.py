from utils import *
from features import *
import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math


"""
DATA = '../analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv'
WINDOW = 60
POST_WINDOW = 5
data = pd.read_csv(DATA)

X, Y = slidingWindowsClosingPrice(data, WINDOW, POST_WINDOW)
de = pd.DataFrame(X)
de['output'] = Y
de.to_csv(path_or_buf=DATA + '_f.csv', header=False, index=False)
pdb.set_trace()
"""

#DATA = '../analyser/rawData/2018-01-20_BTCUSDT_1h_4_mon_.csv'
DATA = '../analyser/rawData/test-sample-mixed.csv'

data = pd.read_csv(DATA)
prices = data.close.values
xtrain, xtest = splitDataset(0.8, 0.2, prices)
preds = (np.random.rand(xtest.shape[0]) >= 0.5).astype(int)

compound_prof, sum_prof, num_deals, num_intervals = walkForwardProfit_noLosses(xtest, preds)
natural = naturalGrowth(xtest)

print('Number of deals: {}'.format(num_deals))
print('Number of intervals: {}'.format(num_intervals))
print('Sum profit: {:.2f}%'.format(sum_prof * 100))
print('Compound profit: {:.2f}%'.format(compound_prof * 100))
print('Buy-and-hold: {:.2f}%'.format(natural * 100))

#pdb.set_trace()

#print('Gained profit: {:.2f}%'.format(wf_prof * 100))
#print('Natural growth: {:.2f}%'.format(natual * 100))



