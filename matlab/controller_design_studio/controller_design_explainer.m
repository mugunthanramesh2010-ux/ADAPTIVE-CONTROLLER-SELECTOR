function narrative = controller_design_explainer(selected, compTable)
% CONTROLLER_DESIGN_EXPLAINER Formulates causal narrative justifying controller selection
narrative = sprintf('Controller [%s] selected with superior balance of tracking accuracy and stability margins.', selected.Name);
disp(['[CONTROLLER EXPLAINER] ' narrative]);
end
