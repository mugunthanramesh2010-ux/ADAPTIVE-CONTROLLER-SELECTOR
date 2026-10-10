function [newGains, adapted] = adaptation_supervisor(currentGains, plantEstimate, errorHistory)
% ADAPTATION_SUPERVISOR Gain scheduling & MRAC supervisory adaptation logic
recentError = mean(abs(errorHistory(max(1, end-20):end)));
if recentError > 0.15
    newGains = currentGains * 1.15;
    adapted = true;
else
    newGains = currentGains;
    adapted = false;
end
end
