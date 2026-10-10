function text = stability_failure_explainer(maxEig)
% STABILITY_FAILURE_EXPLAINER Explains unstable eigenvalue detection
text = sprintf('Verification FAILED: Maximum real closed-loop eigenvalue is %.4f (must be < 0).', maxEig);
end
