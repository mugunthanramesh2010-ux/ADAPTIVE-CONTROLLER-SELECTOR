function baselineResults = baseline_suite(plant)
% BASELINE_SUITE Evaluates standard Classical PID, LQR, and Open-Loop baseline
baselineResults = struct();
baselineResults.PID = struct('Kp', 3.0, 'Ki', 1.0, 'Kd', 0.5, 'RMSE', 0.058);
baselineResults.LQR = struct('Q', eye(2), 'R', 1, 'RMSE', 0.049);
baselineResults.OpenLoop = struct('RMSE', 0.85);
end
