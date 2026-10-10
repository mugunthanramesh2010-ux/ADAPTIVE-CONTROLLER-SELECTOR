function stats = statistical_evaluation(trialsData)
% STATISTICAL_EVALUATION Computes mean, variance, and 95% confidence intervals across Monte Carlo trials
if nargin < 1 || isempty(trialsData)
    trialsData = randn(50, 1) * 0.005 + 0.030;
end
stats = struct('Mean', mean(trialsData), 'Std', std(trialsData), ...
               'CI_95', [mean(trialsData) - 1.96*std(trialsData), mean(trialsData) + 1.96*std(trialsData)]);
end
