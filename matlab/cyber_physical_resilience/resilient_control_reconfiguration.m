function K_rec = resilient_control_reconfiguration(K_nom, compromisedSensors)
% RESILIENT_CONTROL_RECONFIGURATION Zeros feedback gains corresponding to hacked channels
K_rec = K_nom;
if any(compromisedSensors == 1)
    K_rec(1) = 0.0; % rely on secondary states
end
end
