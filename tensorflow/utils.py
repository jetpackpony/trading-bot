import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math
import plotly
from plotly.graph_objs import Scatter, Layout

def splitDataset(trainP, testP, data):
    num = data.shape[0]
    trainNum = math.ceil(num * trainP)
    testNum = num - trainNum

    return [data[0:trainNum:1], data[trainNum::1]]

# Normalizing by the rows
def normalize(data):
    mu = np.mean(a=data, axis=1, keepdims=True)
    sigma = np.std(a=data, axis=1, keepdims=True)
    return (data - mu) / sigma

# Normalizing by the cols
def normalizeByColumns(data):
    mu = np.mean(a=data, axis=0, keepdims=True)
    sigma = np.std(a=data, axis=0, keepdims=True)
    return (data - mu) / sigma

def reNormalize(data, mu, sigma):
    return (data - mu) / sigma

get_prof = np.vectorize(lambda x: x['sell'] / x['buy'] - 1)
is_closed = lambda x: x['sell'] != None
def walkForwardProfit(prices, preds):
    profit = 0
    deals = []
    for i in range(0, len(preds)):
        if len(deals) > 0 and deals[-1]['sell'] == None:
            deals[-1]['sell'] = prices[i]

        if preds[i] == 1:
            #if len(deals) == 0 or deals[-1]['sell'] != None:
            deals.append({ "buy": prices[i], "sell": None })
        #else:
            #if len(deals) > 0:
                #deals[-1]['sell'] = prices[i]

    deals = np.array(list(filter(is_closed, deals)))
    profs = get_prof(deals)
    #profit = np.sum(profs)
    print('Sum of profits: {:.2f}%'.format(np.sum(profs) * 100))

    base = 100
    for i in range(0, len(profs)):
        base = base * (1 + profs[i])

    profit = (base - 100) / 100

    return profit

get_prof_with_comm = np.vectorize(lambda x: x['sellC'] / x['buyC'] - 1)
is_closed = lambda x: x['sell'] != None
comm = 0.0005
def walkForwardProfit_noLosses(prices, preds):
    profit = 0
    deals = []
    for i in range(0, len(preds)):
        if preds[i] == 1:
            if len(deals) == 0 or deals[-1]['sell'] != None:
                deals.append({
                    "buy": prices[i],
                    "buyC": prices[i] * (1 + comm),
                    "sell": None
                    })
        else:
            if len(deals) > 0 and deals[-1]['sell'] == None:
                sellC = prices[i] * (1 - comm)
                profit = sellC / deals[-1]['buyC'] - 1
                if profit < -0.01 or profit > 0.015:
                    deals[-1]['sell'] = prices[i]
                    deals[-1]['sellC'] = sellC

    deals = np.array(list(filter(is_closed, deals)))
    profs = get_prof_with_comm(deals)

    init_position = 1
    position = init_position
    for i in range(0, len(profs)):
        position = position * (1 + profs[i])

    compound_prof = position / init_position - 1

    sum_prof = np.sum(profs)
    num_deals = deals.shape[0]
    num_intervals = preds.shape[0]

    return compound_prof, sum_prof, num_deals, num_intervals

def naturalGrowth(prices):
    first = np.mean(prices[0:100])
    last = np.mean(prices[-100:])

    return last / first - 1

def precisionRecall(targ, pred):
    targ = targ.flatten()
    pred = pred.flatten()
    targ_pos_ids = np.argwhere(targ)
    pred_pos_ids = np.argwhere(pred)
    true_pos = pred[targ_pos_ids]

    precision = np.count_nonzero(true_pos) / len(pred_pos_ids)
    recall = np.count_nonzero(true_pos) / len(targ_pos_ids)

    #pdb.set_trace()

    return precision, recall

def plotData(values, window_size):
    buyIds = np.where(values['output'].values)[0]
    buyPrices = values[[window_size]].iloc[buyIds]

    prices = Scatter(
            x=values.index,
            y=values[window_size]
            )
    buyPoints = Scatter(
            x=buyPrices.index,
            y=buyPrices[window_size],
            mode='markers'
            )
    res = plotly.offline.plot(
            [prices, buyPoints],
            config={ "scrollZoom": True }
            )


def get_accuracy(targ, pred):
    targ = targ.flatten()
    pred = pred.flatten()
    tmp = np.vstack((targ, pred)).transpose()
    corret = np.where(tmp[:,0] == tmp[:,1])[0].shape[0]
    everything = tmp.shape[0]

    return corret / everything

def plotDataNew(data, output, post_window_size, time):
    outPrices = data.close.loc[time]
    buyIds = np.where(output)[0]
    buyPrices = outPrices.iloc[buyIds]

    prices = Scatter(
            x=data.index,
            y=data['close']
            )
    buyPoints = Scatter(
            x=buyPrices.index,
            y=buyPrices,
            mode='markers'
            )
    res = plotly.offline.plot(
            [prices, buyPoints],
            config={ "scrollZoom": True }
            )

def plotDataWithPredictions(data, output, pred, post_window_size, time):
    output = output.flatten()
    pred = pred.flatten()
    truePosIds = np.intersect1d(
            np.where(pred == 1)[0],
            np.where(output == 1)[0],
            assume_unique=True)
    falsePosIds = np.setdiff1d(
            np.where(pred == 1)[0],
            np.where(output == 1)[0],
            assume_unique=True)
    upIds = np.where(output)[0]

    outPrices = data.close.loc[time]
    upPrices = outPrices.iloc[upIds]
    truePosPrices = outPrices.iloc[truePosIds]
    falsePosPrices = outPrices.iloc[falsePosIds]

    prices = Scatter(
            x=data.index,
            y=data['close']
            )
    actualUpTrend = Scatter(
            x=upPrices.index,
            y=upPrices,
            mode='markers',
            name='actual',
            marker={ "color": "orange" },
            )
    truePos = Scatter(
            x=truePosPrices.index,
            y=truePosPrices,
            mode='markers',
            name='correct',
            marker={ "color": "green" },
            )
    falsePos = Scatter(
            x=falsePosPrices.index,
            y=falsePosPrices,
            mode='markers',
            name='wrong',
            marker={ "color": "red" },
            )
    res = plotly.offline.plot(
            [prices, actualUpTrend, truePos, falsePos],
            config={ "scrollZoom": True }
            )

