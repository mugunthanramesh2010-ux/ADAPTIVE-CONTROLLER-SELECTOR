function text = fault_response_explainer(faultClass, actionTaken)
% FAULT_RESPONSE_EXPLAINER Explains root-cause mitigation action
text = sprintf('Diagnosed [%s]. Executed [%s] to preserve closed-loop stability.', faultClass, actionTaken);
end
