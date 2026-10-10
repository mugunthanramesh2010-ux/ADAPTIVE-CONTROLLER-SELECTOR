function y_meas = sensor_noise_degradation(y_true, baseSigma, degradeFactor)
% SENSOR_NOISE_DEGRADATION Elevated Gaussian noise due to analog sensor wear
sigma = baseSigma * degradeFactor;
y_meas = y_true + sigma * randn();
end
