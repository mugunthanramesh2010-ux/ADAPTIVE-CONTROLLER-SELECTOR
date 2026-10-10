function [r, isDiverged] = twin_residual_monitor(y_plant, y_twin, threshold)
% TWIN_RESIDUAL_MONITOR Measures Euclidean deviation between plant and digital twin
if nargin < 3, threshold = 0.50; end
r = y_plant - y_twin;
isDiverged = (abs(r) > threshold);
end
