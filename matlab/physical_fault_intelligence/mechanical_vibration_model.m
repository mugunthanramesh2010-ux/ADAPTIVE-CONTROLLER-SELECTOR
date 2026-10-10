function [eta_next, y_vib] = mechanical_vibration_model(eta, v_eta, u, dt)
% MECHANICAL_VIBRATION_MODEL Second-order structural flexure mode coupling
wn = 35.0; zeta = 0.02; Gamma = 1.5;
a_eta = -wn^2 * eta - 2*zeta*wn * v_eta + Gamma * u;
v_next = v_eta + dt * a_eta;
eta_next = eta + dt * v_next;
y_vib = 0.2 * eta_next;
end
