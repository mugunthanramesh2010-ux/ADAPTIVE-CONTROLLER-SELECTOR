function isDrifting = model_drift_monitor(residuals, windowSize, threshold)
% MODEL_DRIFT_MONITOR Monitors moving-window residual energy to detect parameter drift
if nargin < 2, windowSize = 50; end
if nargin < 3, threshold = 0.25; end

if length(residuals) < windowSize
    isDrifting = false;
    return;
end

recent = residuals(end-windowSize+1:end);
energy = mean(recent.^2);
isDrifting = (energy > threshold);
end
