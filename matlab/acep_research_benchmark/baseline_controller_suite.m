function baselines = baseline_controller_suite()
% BASELINE_CONTROLLER_SUITE Standard baseline controllers
baselines.PID = struct('Name', 'Ziegler_Nichols_PID', 'Gains', [3.5, 1.0, 0.8]);
baselines.LQR = struct('Name', 'Continuous_LQR', 'Gains', [3.82, 1.45]);
baselines.LeadLag = struct('Name', 'Lead_Lag_Compensator', 'Gains', [2.5, 0.5]);
end
