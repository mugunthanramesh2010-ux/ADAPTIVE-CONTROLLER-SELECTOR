function random_seed_manager(seedVal)
% RANDOM_SEED_MANAGER Sets deterministic pseudo-random generator state
if nargin < 1, seedVal = 42; end
rng(seedVal);
end
