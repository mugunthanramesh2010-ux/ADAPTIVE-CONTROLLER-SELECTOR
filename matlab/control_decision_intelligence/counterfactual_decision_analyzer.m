function analysis = counterfactual_decision_analyzer(rmse_actual, rmse_counterfactual)
% COUNTERFACTUAL_DECISION_ANALYZER Quantifies performance benefit of intervention vs inaction
delta = rmse_counterfactual - rmse_actual;
benefitPct = (delta / rmse_counterfactual) * 100.0;
analysis = struct('ActualRMSE', rmse_actual, 'CounterfactualRMSE', rmse_counterfactual, ...
                  'ErrorReductionPct', benefitPct);
end
