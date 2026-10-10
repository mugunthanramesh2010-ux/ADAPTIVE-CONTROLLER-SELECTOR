function d = band_limited_noise_generator(seed, power, dt)
% BAND_LIMITED_NOISE_GENERATOR Band-limited pseudo-random sequence
rng(seed);
d = sqrt(power / dt) * randn();
end
