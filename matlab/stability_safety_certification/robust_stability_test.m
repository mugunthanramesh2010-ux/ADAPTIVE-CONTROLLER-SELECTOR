function isRobust = robust_stability_test(A_cl, deltaMax)
% ROBUST_STABILITY_TEST Verifies eigenvalue stability under parameter perturbation bounds
if nargin < 2, deltaMax = 0.20; end
p1 = eig(A_cl * (1 + deltaMax));
p2 = eig(A_cl * (1 - deltaMax));
isRobust = all(real(p1) < 0) && all(real(p2) < 0);
end
