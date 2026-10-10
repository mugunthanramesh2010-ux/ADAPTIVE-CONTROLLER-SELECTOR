function isClean = experiment_result_validator(telemetry)
% EXPERIMENT_RESULT_VALIDATOR Asserts no NaN or Inf values occurred during run
isClean = ~any(isnan(telemetry.PlantOutput)) && ~any(isinf(telemetry.PlantOutput));
end
