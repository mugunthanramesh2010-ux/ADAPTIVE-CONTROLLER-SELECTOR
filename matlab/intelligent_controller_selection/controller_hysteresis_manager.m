function trigger = controller_hysteresis_manager(metricNew, metricOld, hystBand)
% CONTROLLER_HYSTERESIS_MANAGER Prevents switching unless improvement exceeds hysteresis band
if nargin < 3 || isempty(hystBand), hystBand = 0.08; end
trigger = (metricOld - metricNew) > hystBand;
end
