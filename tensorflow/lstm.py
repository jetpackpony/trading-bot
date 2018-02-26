from metrics import *
from utils import *
from data_utils import *
from plotting import *
import lstm
import pdb
import pandas as pd
import numpy as np

import keras
import keras.backend as K
from keras.layers.core import Dense, Activation, Dropout, Flatten
from keras.layers.recurrent import LSTM
from keras.models import Sequential
from keras.callbacks import ReduceLROnPlateau

def stock_loss(y_true, y_pred):
    alpha = 100.
    loss = K.switch(K.less(y_true * y_pred, 0), \
        alpha*y_pred**2 - K.sign(y_true)*y_pred + K.abs(y_true), \
        K.abs(y_true - y_pred)
        )
    return K.mean(loss, axis=-1)

def fit_model(layers, dropouts, xtrain, ytrain, epochs, batch_size):
    model = Sequential()
    model.add(LSTM(layers[0],
        input_shape=xtrain.shape[1:],
        return_sequences=True,
        #bias_initializer='ones',
        dropout=dropouts[1],
        #recurrent_dropout=dropouts[1]
        ))
    model.add(LSTM(layers[1],
        return_sequences=False,
        #bias_initializer='ones',
        dropout=dropouts[1],
        #recurrent_dropout=dropouts[1]
        ))
    #model.add(Flatten())
    model.add(Dense(1, activation='linear'))

    opt = keras.optimizers.Nadam(lr=0.02, clipnorm = 0.5)
    reduce_lr = keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.9,
            patience=50,
            min_lr=0.000001,
            verbose=1)
    model.compile(loss="mean_squared_error",
    #model.compile(loss=stock_loss,
            optimizer="rmsprop",
            #optimizer=opt
            )

    return model, model.fit(
            xtrain,
            ytrain,
            batch_size=batch_size,
            epochs=epochs,
            validation_split=0.05,
            verbose=1,
            #callbacks=[reduce_lr],
            shuffle=True
            )

def fit_model_stateful(layers, dropouts, xtrain, ytrain, epochs, batch_size):
    model = Sequential()
    model.add(LSTM(layers[0],
        batch_input_shape=(batch_size, xtrain.shape[1], xtrain.shape[2]),
        stateful=True
        ))
    #model.add(Dropout(dropouts[0]))
    #model.add(LSTM(layers[1],
        #return_sequences=False))
    #model.add(Dropout(dropouts[1]))
    model.add(Dense(1))

    model.compile(loss="mean_squared_error", optimizer="adam")
    #model.compile(loss="mean_absolute_error", optimizer="adam")

    for i in range(epochs):
        model.fit(xtrain, ytrain, epochs=1, batch_size=batch_size, verbose=1, shuffle=False)
        model.reset_states()
        print("{}/{} epoch complete".format(i + 1, epochs))

    return model

def predict_stateful(model, X, batch_size, preseedX):

    # Preseed with train data
    for i in range(preseedX.shape[0]):
        model.predict(preseedX[i].reshape(1,1,1))

    # Predict the values from test
    pred = np.array([[0]])
    for i in range(X.shape[0]):
        pr = model.predict(X[i].reshape(1,1,1))
        pred = np.concatenate((pred, pr))

    pred = pred[1:]
    model.reset_states()
    return pred


def logReturnsSetup(fileName, columnName):
    WINDOW = 30
    LAYERS = [128, 256]
    DROPOUTS = [0., 0.]
    EPOCHS = 10
    BATCH_SIZE = 64

    data = prepareLogReturnsSet(fileName, columnName, WINDOW)
    #plotPredActual(np.array([]), np.reshape(data['test']['y'], (data['test']['y'].shape[0], 1, 1)))

    model, history = lstm.fit_model(
            xtrain=data['train']['x'],
            ytrain=data['train']['y'],
            layers=LAYERS,
            dropouts=DROPOUTS,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE
            )

    pred = model.predict(data['test']['x'])
    pred3d = np.reshape(pred, (pred.shape[0], 1, 1))
    ytest3d = np.reshape(data['test']['y'], (data['test']['y'].shape[0], 1, 1))
    predDenorm = deNormalizeSigmoid(pred3d, data['test']['mu'], data['test']['sigma'])
    ytestDenorm = deNormalizeSigmoid(ytest3d, data['test']['mu'], data['test']['sigma'])
    #plotPredActual(predDenorm, ytestDenorm)

    signPercent = correctSignPercent(predDenorm, ytestDenorm)
    percentWithin5 = percentWithin(predDenorm, ytestDenorm, border=0.05)
    RSq = RSquared(predDenorm, ytestDenorm)

    print('Correct return sign prediction: {:.2f}%'.format(signPercent * 100))
    print('Predictions within 5%: {:.2f}%'.format(percentWithin5 * 100))
    print('R squared: {}'.format(RSq))

def closePriceStdNormalizedSetup(fileName, columnName):
    WINDOW = 10
    LAYERS = [128, 256]
    DROPOUTS = [0.3, 0.3]
    EPOCHS = 10
    BATCH_SIZE = 64

    data = prepareSinglePriceSet(fileName, columnName, WINDOW)
    #plotPredActual(np.array([]), np.reshape(data['test']['y'], (data['test']['y'].shape[0], 1, 1)))

    model, history = lstm.fit_model(
            xtrain=data['train']['x'],
            ytrain=data['train']['y'],
            layers=LAYERS,
            dropouts=DROPOUTS,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE
            )

    pred = model.predict(data['test']['x'])
    pred3d = np.reshape(pred, (pred.shape[0], 1, 1))
    ytest3d = np.reshape(data['test']['y'], (data['test']['y'].shape[0], 1, 1))
    predDenorm = deNormalize(pred3d, data['test']['mu'], data['test']['sigma'])
    ytestDenorm = deNormalize(ytest3d, data['test']['mu'], data['test']['sigma'])
    plotPredActual(predDenorm, ytestDenorm)

    signPercent = correctSignPercentRoll(predDenorm, ytestDenorm)
    percentWithin5 = percentWithin(predDenorm, ytestDenorm, border=0.05)
    RSq = RSquared(predDenorm, ytestDenorm)

    print('Correct return sign prediction: {:.2f}%'.format(signPercent * 100))
    print('Predictions within 5%: {:.2f}%'.format(percentWithin5 * 100))
    print('R squared: {}'.format(RSq))

def statefulLSTMMinMaxSetup(fileName, columnName):
    WINDOW = 2
    LAYERS = [128, 256]
    DROPOUTS = [0., 0.]
    EPOCHS = 1
    BATCH_SIZE = 1

    data = prepareSinglePriceMinMaxSet(fileName, columnName, WINDOW)

    origPrices = data['test']['prices']
    deNorm = data['test']['scaler'].inverse_transform(data['test']['y'])
    prices = origPrices.reshape(origPrices.shape[0], 1)[1:]

    model = lstm.fit_model_stateful(
            xtrain=data['train']['x'],
            ytrain=data['train']['y'],
            layers=LAYERS,
            dropouts=DROPOUTS,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE
            )

    pred = lstm.predict_stateful(model,
            X=data['test']['x'],
            batch_size=BATCH_SIZE,
            preseedX=data['train']['x'][-500:])

    predDenorm = data['test']['scaler'].inverse_transform(pred)
    ytestDenorm = data['test']['scaler'].inverse_transform(data['test']['y'])

    predDenorm = np.reshape(predDenorm, (predDenorm.shape[0], 1, 1))
    ytestDenorm = np.reshape(ytestDenorm, (ytestDenorm.shape[0], 1, 1))

    plotPredActual(predDenorm, ytestDenorm)

    signPercent = correctSignPercent(predDenorm, ytestDenorm)
    percentWithin5 = percentWithin(predDenorm, ytestDenorm, border=0.05)
    RSq = RSquared(predDenorm, ytestDenorm)

    print('Correct return sign prediction: {:.2f}%'.format(signPercent * 100))
    print('Predictions within 5%: {:.2f}%'.format(percentWithin5 * 100))
    print('R squared: {}'.format(RSq))

