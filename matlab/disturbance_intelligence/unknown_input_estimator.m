function d_hat = unknown_input_estimator(x_dot, A, x, B, u)
% UNKNOWN_INPUT_ESTIMATOR Inverts plant input matrix to estimate unmodeled disturbance
d_hat = pinv(B) * (x_dot - A*x) - u;
end
