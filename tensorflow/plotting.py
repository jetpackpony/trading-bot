import pdb
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math
import plotly
from plotly.graph_objs import Scatter, Layout

def plotPredActual(pred, actual):
    predLine = Scatter(
            x=np.arange(pred.shape[0]),
            y=pred.flatten(),
            name='predicion'
            )
    actualLine = Scatter(
            x=np.arange(actual.shape[0]),
            y=actual.flatten(),
            name='actual'
            )

    res = plotly.offline.plot(
            [actualLine, predLine],
            config={ "scrollZoom": True }
            )
