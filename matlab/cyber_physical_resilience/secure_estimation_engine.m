function x_hat = secure_estimation_engine(A, x, B, u, y_meas, C, L, isAttacked)
% SECURE_ESTIMATION_ENGINE Resilient observer that discounts compromised measurement channels
if isAttacked
    % Pure model prediction without compromised sensor correction
    x_hat = A * x + B * u;
else
    x_hat = A * x + B * u + L * (y_meas - C * x);
end
end
