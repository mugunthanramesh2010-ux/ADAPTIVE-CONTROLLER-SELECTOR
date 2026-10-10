function scores = candidate_evaluator(candidates, plant)
% CANDIDATE_EVALUATOR Evaluates and ranks controller candidates using multi-objective metrics
n = length(candidates);
scores = zeros(n, 1);
for i = 1:n
    % Score based on simulated tracking RMSE, control effort, and stability margin
    scores(i) = 0.5 * candidates(i).tracking + 0.3 * candidates(i).effort + 0.2 * candidates(i).decay;
end
[~, rankIdx] = sort(scores, 'descend');
fprintf('Candidate Evaluator: Best candidate index is #%d\n', rankIdx(1));
end
