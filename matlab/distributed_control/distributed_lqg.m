function [u, x_hat] = distributed_lqg(A, B, C, Q, R, Wn, Vn, measurements, u_prev, adjacency)
% DISTRIBUTED_LQG Distributed Linear Quadratic Gaussian Control (Kalman Filter + LQR)
%
% Syntax:
%   [u, x_hat] = distributed_lqg(A, B, C, Q, R, Wn, Vn, measurements, u_prev, adjacency)

    % Kalman Filter Observer Gain L
    [~, L, ~] = kalman(ss(A, [B eye(size(A, 1))], C, [zeros(size(C, 1), size(B, 2)) eye(size(C, 1))]), Wn, Vn);

    % LQR Control Gain K
    [K, ~] = lqr(A, B, Q, R);

    N = size(measurements, 2);
    x_hat = zeros(size(A, 1), N);
    u = zeros(size(B, 2), N);

    for i = 1:N
        % Distributed Kalman estimation step
        y_meas = measurements(:, i);
        x_est = (A - B * K - L * C) * u_prev(:, i) + L * y_meas;
        x_hat(:, i) = x_est;

        % Feedback control action
        u(:, i) = -K * x_est;
    end

    disp('Distributed LQG State Estimation & Actuation Updated');
end
