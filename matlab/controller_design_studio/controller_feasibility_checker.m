function [isFeasible, details] = controller_feasibility_checker(K, plant, u_max)
% CONTROLLER_FEASIBILITY_CHECKER Verifies closed-loop Hurwitz property and saturation margin
if nargin < 3 || isempty(u_max), u_max = 15.0; end
A_cl = plant.A - plant.B * [K(1), K(2)];
eigs_cl = eig(A_cl);
isStable = all(real(eigs_cl) < -1e-4);
headroom = u_max - abs(K(1) * 1.0); % test on unit step
isFeasible = isStable && (headroom > 0);

details = struct('IsStable', isStable, 'Eigenvalues', eigs_cl, ...
                 'ActuatorHeadroom', headroom, 'IsFeasible', isFeasible);
end
