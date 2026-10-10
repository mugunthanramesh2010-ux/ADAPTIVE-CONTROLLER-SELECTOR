function u_eff = actuator_stuck_fault_model(u_cmd, isStuck, stuckValue)
% ACTUATOR_STUCK_FAULT_MODEL Actuator freeze at constant output
if isStuck
    u_eff = stuckValue;
else
    u_eff = u_cmd;
end
end
