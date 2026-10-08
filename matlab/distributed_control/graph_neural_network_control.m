function output = graph_neural_network_control(adjacency, states)
% GRAPH_NEURAL_NETWORK_CONTROL Message passing graph convolution across distributed swarm topology
%
% Syntax:
%   output = graph_neural_network_control(adjacency, states)
%
% Inputs:
%   adjacency - Adjacency matrix of agent communication topology (N x N)
%   states    - State vectors of agents (feature_dim x N)
%
% Outputs:
%   output    - Aggregated neighbor message embeddings for control synthesis

    % Degree matrix normalization (Symmetric Laplacian convolution)
    D = diag(sum(adjacency, 2));
    inv_sqrt_D = diag(1 ./ sqrt(max(diag(D), 1e-6)));
    norm_adj = inv_sqrt_D * adjacency * inv_sqrt_D;

    % GNN 1st-order neighborhood aggregation
    output = states * norm_adj;
end
