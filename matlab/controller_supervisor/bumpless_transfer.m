function u_smooth = bumpless_transfer(u_target, u_prev, tau, dt)
% BUMPLESS_TRANSFER Smooth first-order low-pass actuator transition filter
if nargin < 3, tau = 0.05; end
if nargin < 4, dt = 0.01; end

alpha = dt / (tau + dt);
u_smooth = (1 - alpha) * u_prev + alpha * u_target;
end
