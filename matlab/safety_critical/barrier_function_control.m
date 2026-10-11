function [u_safe, slack] = barrier_function_control(u_nominal, x, x_max)
% BARRIER_FUNCTION_CONTROL Control Barrier Function (CBF) Filter
    h = x_max - x(1); % Safety barrier: h(x) >= 0
    Lfh = -x(2);
    Lgh = -1.0;
    alpha_h = 2.0 * h;
    % Solve QP: min |u - u_nominal|^2 s.t. Lfh + Lgh*u + alpha(h) >= 0
    if Lfh + Lgh*u_nominal + alpha_h < 0
        u_safe = (Lfh + alpha_h) / (-Lgh);
        slack = abs(u_safe - u_nominal);
        disp(['CBF Engaged: Nominal Action Filtered by Slack = ', num2str(slack)]);
    else
        u_safe = u_nominal;
        slack = 0;
    end
end
