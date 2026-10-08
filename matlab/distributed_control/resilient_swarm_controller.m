function u = resilient_swarm_controller(states, adjacency, malformedAgentMask)
% RESILIENT_SWARM_CONTROLLER Resilient Byz-tolerant Swarm Consensus Controller
%
% Implements Mean Subsequence Reduced (W-MSR) filtering to ensure swarm consensus
% even when up to F agents exhibit Byzantine adversarial behaviors or malicious drifts.

    [stateDim, N] = size(states);
    u = zeros(stateDim, N);
    F = 1; % Maximum tolerated adversarial nodes per neighborhood

    for i = 1:N
        neighbors = find(adjacency(i, :) == 1);
        if isempty(neighbors)
            u(:, i) = -0.5 * states(:, i);
            continue;
        end

        for d = 1:stateDim
            neighborVals = states(d, neighbors);
            % Sort neighbor values
            sortedVals = sort(neighborVals);
            % Trim F largest and F smallest values if sufficient neighbors exist
            if length(sortedVals) > 2 * F
                trimmedVals = sortedVals((F + 1):(end - F));
            else
                trimmedVals = sortedVals;
            end

            % Filtered consensus push
            targetVal = mean(trimmedVals);
            u(d, i) = -0.7 * (states(d, i) - targetVal);
        end
    end

    disp('Resilient Swarm Controller Executed: Byzantine Nodes Filtered');
end
