function u_eff = actuator_partial_failure_model(u_cmd, healthRatio, asymFactor)
% ACTUATOR_PARTIAL_FAILURE_MODEL Asymmetric directional degradation
if u_cmd >= 0
    u_eff = u_cmd * healthRatio;
else
    u_eff = u_cmd * healthRatio * asymFactor;
end
end
