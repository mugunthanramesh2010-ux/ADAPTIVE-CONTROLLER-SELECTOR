function [theta_hat, P] = online_parameter_estimator(y, phi, theta_prev, P_prev, lambda)
% ONLINE_PARAMETER_ESTIMATOR Recursive Least Squares (RLS) with exponential forgetting factor
if nargin < 5, lambda = 0.98; end

K = (P_prev * phi) / (lambda + phi' * P_prev * phi);
e = y - phi' * theta_prev;
theta_hat = theta_prev + K * e;
P = (P_prev - K * phi' * P_prev) / lambda;
end
