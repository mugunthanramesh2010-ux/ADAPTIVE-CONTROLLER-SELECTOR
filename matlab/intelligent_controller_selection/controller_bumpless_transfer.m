function u_smooth = controller_bumpless_transfer(u_target, u_prev, tau, dt)
% CONTROLLER_BUMPLESS_TRANSFER Low-pass filter eliminating control spikes during handover
if nargin < 3 || isempty(tau), tau = 0.04; end
if nargin < 4 || isempty(dt), dt = 0.01; end
a = dt / (tau + dt);
u_smooth = (1 - a) * u_prev + a * u_target;
end
