from strategies import mavg
import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math

def test_strategy(data, short_period, long_period, cutoff):
    strat = mavg.mavg_strategy(short_period, long_period, cutoff)
    for i in range(0, data.shape[0]):
        strat.handle_data(data.loc[0:i])

    gains = strat.deals['profit'].sum()
    return { 'short': short_period,
             'long': long_period,
             'cutoff': cutoff,
             'gains': gains,
             'num_deals': strat.deals.shape[0]}


#data = pd.read_csv('../analyser/rawData/2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv')
data = pd.read_csv('../analyser/rawData/2018-01-18_ETHBTC_1m_0.12_mon_.csv')

res = np.array([])
for short_period in [3, 5, 8, 13, 21, 34]:
    for long_period in [5, 8, 13, 21, 34, 55, 89, 144]:
        for cutoff in [0.01, 0.005]:
            if short_period >= long_period:
                continue
            print('Doing s:{}, l:{}, c:{}' \
                    .format(short_period, long_period, cutoff))
            r = test_strategy(data, short_period, long_period, cutoff)
            res = np.append(res, r)

res = pd.DataFrame(columns=['short', 'long', 'cutoff', 'gains', 'num_deals'],
                    data=list(res))
print('Bestest strats:')
print(res.sort_values('gains', ascending=False))
