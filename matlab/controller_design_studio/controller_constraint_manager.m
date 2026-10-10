function u_out = controller_constraint_manager(u_cmd, u_max, u_rate_max, dt, u_prev)
% CONTROLLER_CONSTRAINT_MANAGER Enforces actuator amplitude and rate limit constraints
if nargin < 3 || isempty(u_rate_max), u_rate_max = 100.0; end
if nargin < 4 || isempty(dt), dt = 0.01; end
if nargin < 5 || isempty(u_prev), u_prev = u_cmd; end

% Rate limit
du = (u_cmd - u_prev) / dt;
du_clamped = max(-u_rate_max, min(u_rate_max, du));
u_rate_limited = u_prev + dt * du_clamped;

% Amplitude clamp
u_out = max(-u_max, min(u_max, u_rate_limited));
end
