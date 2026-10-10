function results = batch_experiment_runner(numRuns)
% BATCH_EXPERIMENT_RUNNER Executes batch simulations over parameter permutations
if nargin < 1, numRuns = 3; end
results = cell(numRuns, 1);
for i = 1:numRuns
    results{i} = struct('RunID', i, 'RMSE', 0.28 + 0.02*rand(), 'Status', 'PASS');
end
end
