function u_safe = control_barrier_filter(u_nom, x, gamma, u_max)
% CONTROL_BARRIER_FILTER Control Barrier Function (CBF) quadratic filter: dh/dt + gamma*h >= 0
if nargin < 3, gamma = 1.5; end
if nargin < 4, u_max = 15.0; end
h = 2.0^2 - x(1)^2;
Lfh = -2 * x(1) * x(2);
Lgh = -2 * x(1) * 10.0; % B(2)

% Constraint: Lgh * u >= -Lfh - gamma * h
cbf_bound = (-Lfh - gamma * h) / (Lgh + 1e-6);
if Lgh > 0
    u_cbf = max(u_nom, cbf_bound);
else
    u_cbf = min(u_nom, cbf_bound);
end
u_safe = max(-u_max, min(u_max, u_cbf));
end
