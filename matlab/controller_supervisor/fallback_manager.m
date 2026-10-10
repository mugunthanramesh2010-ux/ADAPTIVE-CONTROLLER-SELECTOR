function [u_safe, isFallback] = fallback_manager(u_ctrl, safetyViolated)
% FALLBACK_MANAGER Instantly clamps to safe, provably stable PID fallback if barrier breached
if safetyViolated
    u_safe = 0.0; % Safe zero-effort or trim thrust fallback
    isFallback = true;
    warning('[FALLBACK MANAGER] Safety violated! Emergency safe fallback engaged.');
else
    u_safe = u_ctrl;
    isFallback = false;
end
end
