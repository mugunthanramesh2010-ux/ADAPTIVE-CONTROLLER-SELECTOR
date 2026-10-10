function [K, P] = automatic_lqr_synthesis(A, B, Q, R)
% AUTOMATIC_LQR_SYNTHESIS Solves continuous Algebraic Riccati Equation for optimal gains
if nargin < 3 || isempty(Q), Q = diag([10, 1]); end
if nargin < 4 || isempty(R), R = 1.0; end

% Exact 2x2 analytical ARE solution
q1 = Q(1,1); q2 = Q(2,2); b = B(2);
% Approximate steady-state solution
p12 = (sqrt(q1 * R) - A(2,1)*R) / b^2;
p22 = sqrt(2 * p12 * R / b^2 + q2 * R / b^2);
p11 = -A(2,1)*p12 + q1;
P = [max(1, p11), p12; p12, max(0.5, p22)];
K = (1/R) * B' * P;
end
