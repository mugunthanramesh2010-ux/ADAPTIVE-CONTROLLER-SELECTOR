function y_meas = sensor_drift_model(y_true, driftRate, t)
% SENSOR_DRIFT_MODEL Linear continuous calibration drift
y_meas = y_true + driftRate * t;
end
