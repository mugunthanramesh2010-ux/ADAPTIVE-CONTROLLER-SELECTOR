function isConsistent = explanation_consistency_checker(narrativeRMSE, actualRMSE)
% EXPLANATION_CONSISTENCY_CHECKER Verifies natural language claims match recorded telemetry
isConsistent = abs(narrativeRMSE - actualRMSE) < 1e-3;
end
