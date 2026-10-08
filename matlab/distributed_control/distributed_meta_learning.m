function [adaptedPolicyWeights, metaLoss] = distributed_meta_learning(taskGradients, initialWeights, alpha_inner, beta_outer)
% DISTRIBUTED_META_LEARNING Model-Agnostic Meta-Learning (MAML) for Swarm Adaptation
%
% Learns a meta-initialization of neural controller weights enabling single-step
% adaptation to drastically varied aerodynamic payloads, wind profiles, or failures.

    if nargin < 3; alpha_inner = 0.01; end
    if nargin < 4; beta_outer = 0.005; end

    numTasks = length(taskGradients);
    weightDim = length(initialWeights);

    metaGradient = zeros(weightDim, 1);
    for t = 1:numTasks
        % Task-specific inner gradient update simulation
        g_t = taskGradients{t};
        adapted_w_t = initialWeights - alpha_inner * g_t;

        % Outer meta-gradient accumulation across task distribution
        metaGradient = metaGradient + g_t;
    end

    metaGradient = metaGradient / numTasks;
    adaptedPolicyWeights = initialWeights - beta_outer * metaGradient;
    metaLoss = norm(metaGradient);

    disp(['Distributed Meta-Learning Step Complete: Outer Meta-Loss = ', num2str(metaLoss)]);
end
