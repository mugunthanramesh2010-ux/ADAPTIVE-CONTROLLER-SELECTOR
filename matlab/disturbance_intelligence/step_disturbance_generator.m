function d = step_disturbance_generator(t, t_onset, magnitude)
% STEP_DISTURBANCE_GENERATOR Generates abrupt step disturbance force
d = (t >= t_onset) * magnitude;
end
