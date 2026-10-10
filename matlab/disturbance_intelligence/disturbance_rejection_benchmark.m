function iae = disturbance_rejection_benchmark(errorHistory, dt)
% DISTURBANCE_REJECTION_BENCHMARK Computes Integral Absolute Error (IAE)
iae = sum(abs(errorHistory)) * dt;
end
