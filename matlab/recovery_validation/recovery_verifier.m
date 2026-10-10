function verdict = recovery_verifier(postSwitchError, targetTolerance)
% RECOVERY_VERIFIER Validates that post-switch tracking error settles within bounds
if nargin < 2, targetTolerance = 0.05; end
verdict = (abs(postSwitchError) <= targetTolerance);
end
