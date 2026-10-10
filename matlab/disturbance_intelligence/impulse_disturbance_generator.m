function d = impulse_disturbance_generator(t, t_onset, width, magnitude)
% IMPULSE_DISTURBANCE_GENERATOR Rectangular pulse approximation of Dirac impulse
d = (t >= t_onset && t < t_onset + width) * magnitude;
end
