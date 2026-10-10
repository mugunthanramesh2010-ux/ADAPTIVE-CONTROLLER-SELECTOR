function d = periodic_load_disturbance(t, period, magnitude)
% PERIODIC_LOAD_DISTURBANCE Square-wave periodic torque ripple
tau = mod(t, period);
d = magnitude * (2 * (tau < period/2) - 1);
end
