function [z_next, F_fric] = friction_change_model(z, v, dt)
% FRICTION_CHANGE_MODEL Dynamic LuGre friction internal bristle deflection
sigma0 = 1000.0; sigma1 = 1.2; sigma2 = 0.4; F_c = 1.0; F_s = 1.8; vs = 0.01;
g_v = F_c + (F_s - F_c) * exp(-(v/vs)^2);
dz = v - (sigma0 * abs(v) / g_v) * z;
z_next = z + dt * dz;
F_fric = sigma0 * z_next + sigma1 * dz + sigma2 * v;
end
