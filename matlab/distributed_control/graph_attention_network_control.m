function u = graph_attention_network_control(adjacency, states, attentionWeights)
% GRAPH_ATTENTION_NETWORK_CONTROL Graph Attention Network (GAT) multi-agent controller
%
% Computes attention coefficients between connected agents to weight neighbor state
% influences adaptively based on dynamic priority and proximity.
%
% Syntax:
%   u = graph_attention_network_control(adjacency, states, attentionWeights)

    if nargin < 3
        % Default self-attention computation based on pairwise state correlation
        N = size(states, 2);
        alpha = zeros(N, N);
        for i = 1:N
            for j = 1:N
                if adjacency(i, j) == 1
                    % LeakyReLU attention score
                    e_ij = max(0.2 * dot(states(:, i), states(:, j)), dot(states(:, i), states(:, j)));
                    alpha(i, j) = exp(e_ij);
                end
            end
            if sum(alpha(i, :)) > 0
                alpha(i, :) = alpha(i, :) / sum(alpha(i, :)); % Softmax normalization
            end
        end
    else
        alpha = attentionWeights;
    end

    % Aggregated attention-weighted multi-agent consensus action
    u = -0.8 * states * alpha';
    disp('Graph Attention Network Control Active: Attention Coefficients Updated');
end
