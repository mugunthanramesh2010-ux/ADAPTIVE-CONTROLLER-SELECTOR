function [allowSwitch, state] = controller_switching_supervisor(perfDelta, state, minDwell)
% CONTROLLER_SWITCHING_SUPERVISOR Enforces minimum dwell time to prevent chattering
if nargin < 3 || isempty(minDwell), minDwell = 0.50; end
state.TimeSinceSwitch = state.TimeSinceSwitch + 0.01;

if (state.TimeSinceSwitch >= minDwell) && (perfDelta > 0.10)
    allowSwitch = true;
    state.TimeSinceSwitch = 0.0;
else
    allowSwitch = false;
end
end
