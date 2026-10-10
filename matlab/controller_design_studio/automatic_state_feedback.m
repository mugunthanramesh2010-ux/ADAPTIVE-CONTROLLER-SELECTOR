function K = automatic_state_feedback(A, B, desiredPoles)
% AUTOMATIC_STATE_FEEDBACK Full state-feedback pole placement via Ackermann's formula
if nargin < 3 || isempty(desiredPoles), desiredPoles = [-4.0, -5.0]; end
n = length(desiredPoles);
poly_d = poly(desiredPoles);

% Ackermann calculation for 2x2
Ct = [B, A*B];
phi_A = A^2 + poly_d(2)*A + poly_d(3)*eye(2);
K = [0, 1] * (Ct \ phi_A);
K = real(K);
end
