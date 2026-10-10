function [y_meas, isDropped] = sensor_dropout_model(y_true, y_prev, dropProb)
% SENSOR_DROPOUT_MODEL Simulates packet loss / zero order hold dropout
isDropped = (rand() < dropProb);
if isDropped
    y_meas = y_prev;
else
    y_meas = y_true;
end
end
