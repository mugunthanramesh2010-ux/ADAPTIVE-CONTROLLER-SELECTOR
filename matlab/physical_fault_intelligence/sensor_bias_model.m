function y_meas = sensor_bias_model(y_true, biasVal)
% SENSOR_BIAS_MODEL Injects constant or step sensor calibration offset
y_meas = y_true + biasVal;
end
