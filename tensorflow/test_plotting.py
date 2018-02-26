from plotting import *
import numpy as np

if __name__ == "__main__":
    pred = np.arange(0, 10).reshape(10,1)
    ytest = np.arange(7, 17).reshape(10,1)

    plotPredActual(pred, ytest)


