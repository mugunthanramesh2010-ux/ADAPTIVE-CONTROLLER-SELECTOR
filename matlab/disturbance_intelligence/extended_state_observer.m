function z_next = extended_state_observer(z, y, u, b0, wo, dt)
% EXTENDED_STATE_OBSERVER 3rd-order Hurwitz ESO estimating plant states and total disturbance
beta1 = 3 * wo; beta2 = 3 * wo^2; beta3 = wo^3;
err = y - z(1);
dz1 = z(2) + beta1 * err;
dz2 = z(3) + b0 * u + beta2 * err;
dz3 = beta3 * err;
z_next = z + dt * [dz1; dz2; dz3];
end
