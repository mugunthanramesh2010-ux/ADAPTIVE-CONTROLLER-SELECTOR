function T_next = thermal_degradation_model(T_curr, u_app, dt, T_amb)
% THERMAL_DEGRADATION_MODEL Dynamic Joule heating and thermal dissipation
if nargin < 4 || isempty(T_amb), T_amb = 25.0; end
C_th = 50.0; R_th = 1.5;
P_loss = 0.5 * (u_app^2);
dT = (P_loss - (T_curr - T_amb)/R_th) / C_th;
T_next = T_curr + dt * dT;
end
