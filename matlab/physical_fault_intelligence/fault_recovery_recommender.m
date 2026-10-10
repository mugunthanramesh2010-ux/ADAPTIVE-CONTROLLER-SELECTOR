function rec = fault_recovery_recommender(faultType, severity)
% FAULT_RECOVERY_RECOMMENDER Recommends adaptive parameter boosting or degraded fallback
if strcmp(faultType, 'ACTUATOR_GAIN_DEGRADATION')
    gainBoost = 1.0 / max(0.2, (1.0 - severity));
    rec = struct('Action', 'BOOST_CONTROLLER_GAINS', 'Multiplier', gainBoost);
else
    rec = struct('Action', 'SWITCH_CONSERVATIVE_DAMPING', 'Multiplier', 1.0);
end
end
