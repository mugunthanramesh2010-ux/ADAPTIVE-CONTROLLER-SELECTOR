function [u, K] = distributed_lqr(A, B, Q, R, states, adjacency)
% DISTRIBUTED_LQR Distributed Linear Quadratic Regulator with Neighbor Coupling
%
% Syntax:
%   [u, K] = distributed_lqr(A, B, Q, R, states, adjacency)

    % Standard Riccati equation solution
    P = care(A, B, Q, R);
    K = inv(R) * B' * P;

    % Neighbor-coupled state feedback
    N = size(states, 2);
    u = zeros(size(B, 2), N);

    for i = 1:N
        local_u = -K * states(:, i);
        % Neighbor consensus correction
        neighbors = find(adjacency(i, :) == 1);
        consensus_term = zeros(size(states(:, i)));
        for j = neighbors
            consensus_term = consensus_term + (states(:, j) - states(:, i));
        end
        u(:, i) = local_u + 0.1 * (B' * P * consensus_term);
    end

    disp('Distributed LQR Control Computed');
end
