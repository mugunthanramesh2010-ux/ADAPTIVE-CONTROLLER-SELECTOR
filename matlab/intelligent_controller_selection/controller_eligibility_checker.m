function isEligible = controller_eligibility_checker(candidate, safetyCert)
% CONTROLLER_ELIGIBILITY_CHECKER Checks candidate against safety certification
isEligible = safetyCert.IsCertified && (candidate.Gains(1) > 0);
end
