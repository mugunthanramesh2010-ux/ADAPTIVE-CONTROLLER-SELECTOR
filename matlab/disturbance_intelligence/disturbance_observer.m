function [d_hat, p_next] = disturbance_observer(p, y, u, L, dt)
% DISTURBANCE_OBSERVER Linear nonlinear DOB state integration
d_hat = p + L * y;
dp = -L * (d_hat + u);
p_next = p + dt * dp;
end
