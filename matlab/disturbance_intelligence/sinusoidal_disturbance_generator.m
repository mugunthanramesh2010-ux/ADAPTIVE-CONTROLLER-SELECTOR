function d = sinusoidal_disturbance_generator(t, freqs, amps)
% SINUSOIDAL_DISTURBANCE_GENERATOR Multi-harmonic environmental disturbance
if nargin < 2, freqs = [0.5, 2.0]; end
if nargin < 3, amps = [1.5, 0.5]; end
d = 0;
for i = 1:length(freqs)
    d = d + amps(i) * sin(2*pi*freqs(i)*t);
end
end
