function u_adrc = active_disturbance_rejection(e, z_eso, b0, kp, kd)
% ACTIVE_DISTURBANCE_REJECTION ADRC control law canceling estimated total disturbance
u_adrc = (kp * e - kd * z_eso(2) - z_eso(3)) / b0;
end
