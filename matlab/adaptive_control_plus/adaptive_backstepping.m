function u = adaptive_backstepping(x1, x2, theta_hat)
% ADAPTIVE_BACKSTEPPING Recursive Lyapunov-based nonlinear control
    z1 = x1;
    alpha1 = -2.0 * z1;
    z2 = x2 - alpha1;
    u = -3.0 * z2 - z1 - theta_hat * x1^2;
end
