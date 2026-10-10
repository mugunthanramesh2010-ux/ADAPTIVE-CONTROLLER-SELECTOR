function [u_safe, mode] = attack_mitigation_supervisor(u_nom, x_twin, isAttack)
% ATTACK_MITIGATION_SUPERVISOR Switches to internal digital twin state feedback upon attack alert
if isAttack
    u_safe = -[3.5, 1.2] * x_twin;
    mode = 'CYBER_ISOLATION_TWIN_ESTIMATION';
else
    u_safe = u_nom;
    mode = 'NOMINAL_SENSOR_FEEDBACK';
end
end
