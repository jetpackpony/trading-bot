import pdb
import tensorflow as tf
import numpy as np
import math

tf.logging.set_verbosity(tf.logging.INFO)

def splitDataset(trainP, testP, data):
    num = data.shape[0]
    trainNum = math.ceil(num * trainP)
    testNum = num - trainNum

    return [data[0:trainNum:1], data[trainNum::1]]

def normalize(data):
    mu = np.mean(data, 0)
    sigma = np.std(data, 0)
    res = (data - mu) / sigma

    return [mu, sigma, res]

def reNormalize(data, mu, sigma):
    return (data - mu) / sigma

TOP_PERCENT = 0.02
BOTTOM_PERCENT = 0.01
TRAINING_DATA = '../analyser/rawData/' \
                + '2018-01-15_ETHBTC_1m_6_mon_slice_last_50k.csv-features-w120p120tp0.02bp0.01.csv'

def main():
    t = tf.contrib.learn.datasets.base \
                                .load_csv_without_header(
                                    filename=TRAINING_DATA,
                                    target_dtype=np.int,
                                    features_dtype=np.float32)
    trainDataOrig, testDataOrig = splitDataset(0.8, 0.2, t.data)
    trainTarget, testTarget = splitDataset(0.8, 0.2, t.target)

    mu, sigma, trainData = normalize(trainDataOrig)
    #mu, sigma, testData = normalize(testDataOrig)
    testData = reNormalize(testDataOrig, mu, sigma)

    """
    trainData = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
    testData = trainData
    trainTarget = np.array([0, 1, 1, 0])
    testTarget = trainTarget
    """

    print('Train examples: {}'.format(len(trainTarget)))
    print('Test examples: {}'.format(len(testTarget)))

    feature_columns = [tf.feature_column.numeric_column(
                                "x", shape=trainData[0].shape)]

    classifier = tf.estimator.DNNClassifier(
                          feature_columns=feature_columns,
                          hidden_units=[512, 256, 128],
                          n_classes=2,
                          model_dir='models/w=120,pw=120,hl=512-256-128,lr=0.03,reg=0.1,do=0.5',
                          dropout=0.5,
                          optimizer=tf.train.ProximalAdagradOptimizer(
                              learning_rate=0.03,
                              l1_regularization_strength=0.1
                              )
                          )

    train_input_fn = tf.estimator.inputs.numpy_input_fn(
                                  x={"x": np.array(trainData)},
                                  y=np.array(trainTarget),
                                  num_epochs=None,
                                  shuffle=True)

    classifier.train(input_fn=train_input_fn, steps=10000)

    test_input_fn = tf.estimator.inputs.numpy_input_fn(
          x={"x": np.array(testData)},
          y=np.array(testTarget),
          num_epochs=1,
          shuffle=False)
    train_eval_fn = tf.estimator.inputs.numpy_input_fn(
          x={"x": np.array(trainData)},
          y=np.array(trainTarget),
          num_epochs=1,
          shuffle=False)

    train_accuracy_score = classifier.evaluate(
                            input_fn=train_eval_fn)["accuracy"]
    print("\nTrain Accuracy: {0:f}\n".format(train_accuracy_score))
    accuracy_score = classifier.evaluate(
                            input_fn=test_input_fn)["accuracy"]
    print("\nTest Accuracy: {0:f}\n".format(accuracy_score))

    pred = list(classifier.predict(input_fn=test_input_fn))
    pred_classes = np.array([p['class_ids'][0] for p in pred])
    posNum = np.count_nonzero(pred_classes)
    actualPosNum = np.count_nonzero(testTarget)
    testDataNum = len(testTarget)

    print('Pos found: {}/{} ({:.2f}%/{:.2f}% out of total {} examples)' \
                    .format(posNum, actualPosNum,
                        posNum / testDataNum * 100,
                        actualPosNum / testDataNum * 100,
                        testDataNum))

    precision, update_op = tf.metrics.precision(
                            labels=testTarget,
                            predictions=pred_classes
                            )
    sess = tf.Session()
    sess.run(tf.local_variables_initializer())
    sess.run(update_op)
    prec = sess.run(precision)
    expProfit = TOP_PERCENT * prec - BOTTOM_PERCENT * (1 - prec)
    print('Precision (truePos / allPos): {:.2f}%' \
            .format(prec * 100))
    print('Expected profit per deal: {:.2f}%'.format(expProfit * 100))


if __name__ == "__main__":
    main()
