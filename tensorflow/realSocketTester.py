import pdb
from strategies import mavg
from config import *
import pandas as pd
import numpy as np
from binance.client import Client
from binance.websockets import BinanceSocketManager

api_key = CONFIG['api_key']
api_secret = CONFIG['api_secret']
client = Client(api_key, api_secret)

def fix_names(msg):
    return {
            "time": msg['E'],
            "symbol": msg['s'],
            "openTime": msg['k']['t'],
            "closeTime": msg['k']['T'],
            "interval": msg['k']['i'],
            "firstTradeID": msg['k']['f'],
            "lastTradeID": msg['k']['L'],
            "open": float(msg['k']['o']),
            "close": float(msg['k']['c']),
            "high": float(msg['k']['h']),
            "low": float(msg['k']['l']),
            "volume": float(msg['k']['v']),
            "numberTrades": msg['k']['n'],
            "isFinalBar": msg['k']['x'],
            "quoteVolume": float(msg['k']['q']),
            "activeBuyVolume": float(msg['k']['V']),
            "quoteVolumeActiveBuy": float(msg['k']['Q'])
            }


strat = mavg.mavg_strategy(3, 30, 0.01)
data = pd.DataFrame(columns=[
            "time", "symbol", "openTime", "closeTime", "interval",
            "firstTradeID", "lastTradeID", "open", "close", "high",
            "low", "volume", "numberTrades", "isFinalBar", "quoteVolume",
            "activeBuyVolume", "quoteVolumeActiveBuy"])
def process_message(msg):
    print('.', end="", flush=True)
    msg = fix_names(msg)
    if msg['isFinalBar']:
        data.loc[data.shape[0]] = msg
        strat.handle_data(data)

bm = BinanceSocketManager(client)
bm.start_kline_socket(symbol='ETHBTC', callback=process_message)
bm.start()
