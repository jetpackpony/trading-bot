from utils import *
from features import *
import pdb
import tensorflow as tf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math

tf.logging.set_verbosity(tf.logging.INFO)

DATA = '../analyser/rawData/2018-01-20_BTCUSDT_1h_4_mon_.csv'
WINDOW = 72
POST_WINDOW = 1
data = pd.read_csv(DATA)

X, Y = slidingWindowsClosingPrice(data, WINDOW, POST_WINDOW)

xtrain, xtest = splitDataset(0.8, 0.2, X)
ytrain, ytest = splitDataset(0.8, 0.2, Y)

feature_columns = [tf.feature_column.numeric_column(
                        "x", shape=xtrain[0].shape)]

classifier = tf.estimator.DNNClassifier(
                      feature_columns=feature_columns,
                      hidden_units=[10, 25, 10],
                      dropout=0.25,
                      n_classes=2,
                      optimizer=tf.train.ProximalAdagradOptimizer(
                          learning_rate=0.01,
                          l1_regularization_strength=0.01
                          ),
                      model_dir='models/1h;w72;pw1;n10-25-10;lr=0.01;reg=0.01'
                      )


train_input_fn = tf.estimator.inputs.numpy_input_fn(
                              x={"x": xtrain},
                              y=ytrain,
                              num_epochs=None,
                              shuffle=True)

classifier.train(input_fn=train_input_fn, steps=500)


# Define the test inputs
test_input_fn = tf.estimator.inputs.numpy_input_fn(
  x={"x": xtest},
  y=ytest,
  num_epochs=1,
  shuffle=False)

train_eval_fn = tf.estimator.inputs.numpy_input_fn(
      x={"x": xtrain},
      y=ytrain,
      num_epochs=1,
      shuffle=False)

# Evaluate accuracy.
accuracy_score = classifier.evaluate(input_fn=test_input_fn)
train_accuracy_score = classifier.evaluate(
        input_fn=train_eval_fn)
print("\nTrain Accuracy: {0:f}\n".format(train_accuracy_score["accuracy"]))

print("\nTest Accuracy: {0:f}\n".format(accuracy_score["accuracy"]))

pred = list(classifier.predict(input_fn=test_input_fn))
pred_classes = np.array([p['class_ids'][0] for p in pred])
posNum = np.count_nonzero(pred_classes)
actualPosNum = np.count_nonzero(ytest)
testDataNum = len(ytest)

print('Pos found: {}/{} ({:.2f}%/{:.2f}% out of total {} examples)' \
                .format(posNum, actualPosNum,
                    posNum / testDataNum * 100,
                    actualPosNum / testDataNum * 100,
                    testDataNum))

precision, update_op = tf.metrics.precision(
                        labels=ytest,
                        predictions=pred_classes
                        )
sess = tf.Session()
sess.run(tf.local_variables_initializer())
sess.run(update_op)
prec = sess.run(precision)
#expProfit = TOP_PERCENT * prec - BOTTOM_PERCENT * (1 - prec)
print('Precision (truePos / allPos): {:.2f}%' \
        .format(prec * 100))
#print('Expected profit per deal: {:.2f}%'.format(expProfit * 100))

#xtract from xtest data last prices in each window
prices = np.array(data['close'].tolist())
prices = prices[-(len(pred_classes) + 1):-1]

wf_prof = walkForwardProfit(prices, pred_classes)
natual = naturalGrowth(prices)

print('Gained profit: {:.2f}%'.format(wf_prof * 100))
print('Natural growth: {:.2f}%'.format(natual * 100))









