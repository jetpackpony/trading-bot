import pdb
import pandas as pd
import numpy as np
import talib
import math
import datetime
import time

class mavg_strategy:
    def __init__(self, short_period, long_period, cutoff):
        self.short = short_period
        self.long = long_period
        self.cutoff = cutoff
        self.deals = pd.DataFrame(columns=[
            'buyPrice', 'buyTime', 'sellPrice', 'sellTime', 'profit'])
        self.openDeal = None
        date = datetime.datetime.fromtimestamp(time.time()) \
                                    .strftime('%Y-%m-%d-%H_%M_%S')
        self.log_file = 'logs/mavg/deals-{}.csv'.format(date)
        pass

    def handle_data(self, data):
        time = data.tail(1).loc[:, 'closeTime'].values[0]
        c = data.loc[:, 'close'].values
        mavg_short = talib.SMA(c, timeperiod=self.short)
        mavg_long = talib.SMA(c, timeperiod=self.long)
        if mavg_short[-1] > mavg_long[-1]:
            self.open_deal(price=c[-1], time=time)
        elif mavg_short[-1] < mavg_long[-1]:
            self.close_deal(price=c[-1], time=time)
        #if not math.isnan(mavg_short[-1]) and not math.isnan(mavg_long[-1]):

    def open_deal(self, price, time):
        if not self.openDeal:
            price = price * (1 + 0.0005)
            print('Opening deal at {}'.format(price))
            self.openDeal = { "buyPrice": price, "buyTime": time }

    def close_deal(self, price, time):
        if self.openDeal:
            price = price * (1 - 0.0005)
            profit = price / self.openDeal['buyPrice'] - 1
            # Only sell if the price diverged enough
            if abs(profit) > self.cutoff:
                self.openDeal['sellPrice'] = price
                self.openDeal['sellTime'] = time
                self.openDeal['profit'] = profit
                self.deals.loc[self.deals.shape[0]] = self.openDeal
                self.deals.to_csv(self.log_file, index=False)
                print('Closed deal at {}, profit: {}%' \
                                    .format(price, round(profit * 100, 2)))
                self.openDeal = None


