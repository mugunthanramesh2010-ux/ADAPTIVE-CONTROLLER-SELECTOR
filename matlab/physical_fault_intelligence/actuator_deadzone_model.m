function u_out = actuator_deadzone_model(u_in, deadband)
% ACTUATOR_DEADZONE_MODEL Physical mechanical actuator deadband
if abs(u_in) <= deadband
    u_out = 0.0;
else
    u_out = sign(u_in) * (abs(u_in) - deadband);
end
end
