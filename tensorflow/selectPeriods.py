from utils import *
from features import *
import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math


DATA = '../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv'
data = pd.read_csv(DATA)


data[['close']].loc[47000:48000].plot()

d = data.loc[47000:48000]
d.to_csv("../analyser/rawData/test-sample-short.csv", index=False)
plt.show()
