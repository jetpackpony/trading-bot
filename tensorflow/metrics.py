import keras
import pdb
import numpy as np

class Metrics(keras.callbacks.Callback):
    def on_epoch_end(self, batch, logs={}):
        predict = np.asarray(self.model.predict(self.validation_data[0]))
        targ = self.validation_data[1]
        targ_pos_ids = np.argwhere(targ.flatten()).flatten()
        pred_pos_ids = np.argwhere(predict.flatten() >= 0.5).flatten()
        true_pos = predict[targ_pos_ids].flatten() >= 0.5

        self.precision = np.count_nonzero(true_pos) / len(pred_pos_ids)
        self.recall = np.count_nonzero(true_pos) / len(targ_pos_ids)

        return
