function [selected, bestIdx] = controller_selection_engine(candidates, weights, metrics)
% CONTROLLER_SELECTION_ENGINE Multi-objective ranking selecting optimal admissible controller
if nargin < 2 || isempty(weights)
    weights = struct('w_rmse', 0.5, 'w_effort', 0.3, 'w_decay', 0.2);
end
n = length(candidates);
scores = zeros(n, 1);
for i = 1:n
    scores(i) = weights.w_rmse * metrics(i).rmse + weights.w_effort * metrics(i).effort - weights.w_decay * metrics(i).decay;
end
[~, bestIdx] = min(scores);
selected = candidates{bestIdx};
end
