import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math

def splitDataset(trainP, testP, data):
    num = data.shape[0]
    trainNum = math.ceil(num * trainP)
    testNum = num - trainNum

    return [data[0:trainNum:1], data[trainNum::1]]

def normalize(data):
    mu = np.mean(a=data, axis=1, keepdims=True)
    sigma = np.std(a=data, axis=1, keepdims=True)
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

def naturalGrowth(prices):
    first = np.mean(prices[0:100])
    last = np.mean(prices[-100:])

    return last / first - 1

def precisionRecall(targ, pred):
    targ_pos_ids = np.argwhere(targ)
    pred_pos_ids = np.argwhere(pred)
    true_pos = pred[targ_pos_ids]

    precision = np.count_nonzero(true_pos) / len(pred_pos_ids)
    recall = np.count_nonzero(true_pos) / len(targ_pos_ids)

    return precision, recall

