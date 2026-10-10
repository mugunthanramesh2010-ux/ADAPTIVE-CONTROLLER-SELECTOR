function text = controller_rejection_explainer(candName, breachType, val, limit)
% CONTROLLER_REJECTION_EXPLAINER Explains mathematically why candidate was discarded
text = sprintf('Candidate [%s] discarded due to %s breach: Observed=%.2f, Limit=%.2f.', ...
    candName, breachType, val, limit);
end
