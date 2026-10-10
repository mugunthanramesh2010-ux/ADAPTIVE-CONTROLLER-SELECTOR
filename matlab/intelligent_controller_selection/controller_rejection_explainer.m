function msg = controller_rejection_explainer(candidate, reason)
% CONTROLLER_REJECTION_EXPLAINER Explains why an alternative controller was rejected
msg = sprintf('Candidate [%s] rejected: %s', candidate.Name, reason);
disp(['[SELECTION EXPLAINER] ' msg]);
end
