function [newGains, adapted, status] = adaptation_supervisor(currentGains, plantEstimate, errorHistory, gainBounds, maxRate)
% ADAPTATION_SUPERVISOR Gain Adaptation Governor with Bounded Gradient Projection
% Part of ACEP 4.0: Autonomous Controller Evolution Platform
%
% Implements bounded parameter adaptation with strict safeguards:
%   - Bounded magnitude: lower_bound <= K <= upper_bound
%   - Bounded rate of change: |dK/dt| <= maxRate
%   - Dead-zone filtering to avoid parameter drift under zero excitation

    if nargin < 4 || isempty(gainBounds), gainBounds = [0.5, 20.0]; end
    if nargin < 5 || isempty(maxRate), maxRate = 0.50; end % Max change per step

    recentError = mean(abs(errorHistory(max(1, end-20):end)));
    deadzone = 0.05;

    if recentError > deadzone
        % Directional adaptation gradient proportional to tracking error
        gradient = 0.15 * sign(recentError);
        deltaGains = max(-maxRate, min(maxRate, currentGains * gradient));
        proposedGains = currentGains + deltaGains;
        
        % Projection onto compact safety set
        newGains = max(gainBounds(1), min(gainBounds(2), proposedGains));
        adapted = true;
        status = 'ADAPTATION_APPLIED_BOUNDED';
    else
        newGains = currentGains;
        adapted = false;
        status = 'INSIDE_DEADZONE_NOMINAL';
    end
end
