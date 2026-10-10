function [d_next, w] = colored_noise_generator(d_curr, alpha, dt, sigma)
% COLORED_NOISE_GENERATOR First-order Ornstein-Uhlenbeck colored noise process
if nargin < 4, sigma = 0.5; end
w = sigma * randn();
d_next = (1 - alpha*dt) * d_curr + sqrt(dt) * w;
end
