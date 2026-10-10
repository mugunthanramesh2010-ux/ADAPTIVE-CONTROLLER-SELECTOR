function [I_phase, R_eff] = motor_winding_fault_model(V_app, T_winding, isShortCircuit)
% MOTOR_WINDING_FAULT_MODEL Models thermal degradation and turn-to-turn winding insulation failure
R_0 = 1.2; alpha_cu = 0.00393;
R_eff = R_0 * (1 + alpha_cu * (T_winding - 25));
if isShortCircuit, R_eff = R_eff * 0.60; end % 40% winding short
I_phase = V_app / R_eff;
end
