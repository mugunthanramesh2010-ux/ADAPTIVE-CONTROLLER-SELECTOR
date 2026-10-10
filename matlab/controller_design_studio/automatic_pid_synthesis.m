function pidGains = automatic_pid_synthesis(plant, zeta_d, wn_d)
% AUTOMATIC_PID_SYNTHESIS Computes analytical PID gains matching desired pole targets
if nargin < 2 || isempty(zeta_d), zeta_d = 0.707; end
if nargin < 3 || isempty(wn_d), wn_d = 4.0; end

a0 = abs(plant.A(2,1)); a1 = abs(plant.A(2,2)); b0 = plant.B(2);
Kp = (2 * zeta_d * wn_d - a1) / b0;
Kd = (wn_d^2 - a0) / (5 * b0);
Ki = 0.3 * Kp;

pidGains = struct('Kp', max(0.5, Kp), 'Ki', max(0.1, Ki), 'Kd', max(0.05, Kd));
end
