import pdb
import pandas as pd
import numpy as np
import plotly
from plotly.graph_objs import Scatter, Layout, Figure
from statsmodels.tsa import stattools

#DATAFILE = '../analyser/rawData/2018-01-15_ETHBTC_1h_4_mon_.csv'
DATAFILE = '../analyser/rawData/2018-02-13_ETHBTC_1m_2_mon_.csv'
data = pd.read_csv(DATAFILE)
data.openTime = pd.to_datetime(data['openTime'], unit='ms')
data = data.set_index('openTime')

prices = data.close.values

"""
pricesLine = Scatter(
        x=np.arange(prices.shape[0]),
        y=prices.flatten(),
        name='Close Prices'
        )

res = plotly.offline.plot(
        [pricesLine],
        config={ "scrollZoom": True },
        filename='prices.html'
        )

acf = stattools.acf(prices, nlags=1000)

acfLine = Scatter(
        x=np.arange(acf.shape[0]),
        y=acf.flatten(),
        name='ACF'
        )

res = plotly.offline.plot(
        [acfLine],
        config={ "scrollZoom": True },
        filename='acf.html'
        )

returns = data.close.values - data.open.values

returnsLine = Scatter(
        x=np.arange(returns.shape[0]),
        y=returns.flatten(),
        name='Returns'
        )

res = plotly.offline.plot(
        [returnsLine],
        config={ "scrollZoom": True },
        filename='returns.html'
        )

acfReturns = stattools.acf(returns, nlags=1000)

acfReturnsLine = Scatter(
        x=np.arange(acfReturns.shape[0]),
        y=acfReturns.flatten(),
        name='ACF returns'
        )

res = plotly.offline.plot(
        [acfReturnsLine],
        config={ "scrollZoom": True },
        filename='acfReturns.html'
        )

logReturns = np.log(data.close.values / data.open.values)
plotly.offline.plot(
        [Scatter(
            x=np.arange(logReturns.shape[0]),
            y=logReturns.flatten(),
            name='Returns'
            )],
        config={ "scrollZoom": True },
        filename='logReturns.html'
        )

acfLogReturns = stattools.acf(logReturns, nlags=1000)
plotly.offline.plot(
        [Scatter(
            x=np.arange(acfLogReturns.shape[0]),
            y=acfLogReturns.flatten(),
            name='ACF logReturns'
            )],
        config={ "scrollZoom": True },
        filename='acfLogReturns.html'
        )

mean = data.close.rolling(window=5).mean().values

plotly.offline.plot(
        [
            Scatter(
                x=np.arange(prices.shape[0]),
                y=prices.flatten(),
                name='Close Prices'
                ),
            Scatter(
                x=np.arange(mean.shape[0]),
                y=mean.flatten(),
                name='MA-5'
                )
        ],
        config={ "scrollZoom": True },
        filename='prices.html'
        )
"""

def drawMAACF(maLength):
    mean = data.rolling(window=maLength).mean()
    maLogReturns = np.log(mean.close.values / mean.open.values)
    maLogReturnsNoNans = maLogReturns[np.isnan(maLogReturns) == False]
    acfMALogReturns = stattools.acf(maLogReturnsNoNans, nlags=1000)
    plotly.offline.plot(
            Figure(
                data=[Scatter(
                    x=np.arange(acfMALogReturns.shape[0]),
                    y=acfMALogReturns.flatten(),
                    name='ACF MA-{} logReturns'.format(maLength)
                    )],
                layout=Layout(showlegend=True)
                ),
            config={ "scrollZoom": True },
            filename='acfMA-{}LogReturns.html'.format(maLength),
            )

#for i in range(10, 150, 5):
#    drawMAACF(i)

drawMAACF(20)
