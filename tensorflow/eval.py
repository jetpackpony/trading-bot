from utils import *
from features import *
import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math


DATA = '../analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv'
WINDOW = 60
POST_WINDOW = 5
data = pd.read_csv(DATA)

X, Y = slidingWindowsClosingPrice(data, WINDOW, POST_WINDOW)
de = pd.DataFrame(X)
de['output'] = Y
de.to_csv(path_or_buf=DATA + '_f.csv', header=False, index=False)
pdb.set_trace()

DATA = '../analyser/rawData/2018-01-20_BTCUSDT_1h_4_mon_.csv'

data = pd.read_csv(DATA)
prices = np.array(data['close'].tolist())
xtrain, xtest = splitDataset(0.8, 0.2, prices)
preds = (np.random.rand(xtest.shape[0]) >= 0.5).astype(int)

wf_prof = walkForwardProfit(xtest, preds)
natual = naturalGrowth(xtest)

print('Gained profit: {:.2f}%'.format(wf_prof * 100))
print('Natural growth: {:.2f}%'.format(natual * 100))



