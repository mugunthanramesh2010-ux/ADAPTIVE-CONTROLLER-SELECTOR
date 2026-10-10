function [u_out, state] = switching_manager(u_old, u_new, switchTrigger, state)
% SWITCHING_MANAGER Dwell-time hysteresis supervisor for safe controller handover
if nargin < 4 || isempty(state)
    state = struct('timeSinceSwitch', 10.0, 'minDwellTime', 0.5, 'activeCtrl', 1);
end

if switchTrigger && (state.timeSinceSwitch >= state.minDwellTime)
    state.activeCtrl = 2;
    state.timeSinceSwitch = 0.0;
    u_out = u_new;
    disp('[SWITCHING MANAGER] Controller handover executed.');
else
    u_out = (state.activeCtrl == 1) * u_old + (state.activeCtrl == 2) * u_new;
    state.timeSinceSwitch = state.timeSinceSwitch + 0.01;
end
end
