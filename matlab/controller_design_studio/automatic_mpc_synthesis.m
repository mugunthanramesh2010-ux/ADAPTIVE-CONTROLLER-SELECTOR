function mpcConfig = automatic_mpc_synthesis(A, B, C, Np, Nc)
% AUTOMATIC_MPC_SYNTHESIS Computes receding-horizon prediction matrices for unconstrained/constrained QP
if nargin < 4 || isempty(Np), Np = 10; end
if nargin < 5 || isempty(Nc), Nc = 3; end

Phi = zeros(Np, size(A, 1));
Gamma = zeros(Np, Nc);
for i = 1:Np
    Phi(i, :) = C * (A^i);
    for j = 1:min(i, Nc)
        Gamma(i, j) = C * (A^(i-j)) * B;
    end
end
H = Gamma' * Gamma + 0.1 * eye(Nc);
mpcConfig = struct('Np', Np, 'Nc', Nc, 'Phi', Phi, 'Gamma', Gamma, 'Hessian', H);
end
