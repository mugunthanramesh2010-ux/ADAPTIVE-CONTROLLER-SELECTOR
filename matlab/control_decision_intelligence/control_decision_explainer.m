function text = control_decision_explainer(event, oldCtrl, newCtrl, metrics)
% CONTROL_DECISION_EXPLAINER Formulates human-readable natural language prose
text = sprintf('Event [%s]: Transitioned from %s to %s. Post-switch tracking RMSE improved to %.4f.', ...
    event, oldCtrl, newCtrl, metrics.rmse);
disp(['[DECISION EXPLAINER] ' text]);
end
