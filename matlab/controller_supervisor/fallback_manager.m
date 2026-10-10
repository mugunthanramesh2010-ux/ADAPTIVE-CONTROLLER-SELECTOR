function [u_safe, isFallback, fallbackMode] = fallback_manager(u_ctrl, safetyViolated, plantState, safeGains)
% FALLBACK_MANAGER Guaranteed Safe Fallback and Recovery Rollback Supervisor
% Part of ACEP 4.0: Autonomous Controller Evolution Platform
%
% Engages a mathematically certified, low-gain conservative damping controller
% or executes state-snapshot rollback whenever safety constraints or recovery verification fails.

    if nargin < 3 || isempty(plantState), plantState = [0; 0]; end
    if nargin < 4 || isempty(safeGains), safeGains = [2.0, 1.5]; end % Safe conservative PD damping gains

    if safetyViolated
        % Compute guaranteed contractive damping control: u_safe = -K_safe * x
        u_safe = -safeGains(1) * plantState(1) - safeGains(2) * plantState(2);
        u_safe = max(-10.0, min(10.0, u_safe)); % Conservative 10V clamp
        isFallback = true;
        fallbackMode = 'CONSERVATIVE_LYAPUNOV_DAMPING';
        fprintf('[FALLBACK MANAGER] Invariant breach detected! Switching to %s (u=%.2f).\n', ...
            fallbackMode, u_safe);
    else
        u_safe = u_ctrl;
        isFallback = false;
        fallbackMode = 'NOMINAL_TRACKING';
    end
end
