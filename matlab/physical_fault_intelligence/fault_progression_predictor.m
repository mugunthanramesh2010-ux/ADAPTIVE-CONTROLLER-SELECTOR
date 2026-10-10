function rul = fault_progression_predictor(healthHistory, dt)
% FAULT_PROGRESSION_PREDICTOR Remaining Useful Life (RUL) estimation via linear drift slope
N = length(healthHistory);
slope = (healthHistory(end) - healthHistory(1)) / (N * dt);
if slope >= -1e-5
    rul = 10000.0; % No significant degradation
else
    currHealth = healthHistory(end);
    rul = abs((currHealth - 0.20) / slope); % Time until 20% critical threshold
end
end
