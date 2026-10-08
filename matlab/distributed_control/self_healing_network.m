function network = self_healing_network(network, failedNodes)
% SELF_HEALING_NETWORK Dynamically prunes faulted agents and rebalances adjacency
%
% Syntax:
%   network = self_healing_network(network, failedNodes)
%
% Inputs:
%   network     - Graph adjacency matrix (N x N)
%   failedNodes - Array of indices of compromised or failed nodes
%
% Outputs:
%   network     - Reconfigured self-healed adjacency matrix

    if ~isempty(failedNodes)
        network(:, failedNodes) = [];
        network(failedNodes, :) = [];
        disp('Network Self-Healed: Compromised Nodes Pruned');
    end
end
