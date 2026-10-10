function chromo_mut = controller_mutation_engine(chromo, mutRate, mutSigma)
% CONTROLLER_MUTATION_ENGINE Gaussian genetic mutation with boundary projection
if nargin < 2, mutRate = 0.15; end
if nargin < 3, mutSigma = 0.10; end
chromo_mut = chromo;
for i = 1:length(chromo)
    if rand() < mutRate
        chromo_mut(i) = chromo(i) + mutSigma * randn();
    end
end
chromo_mut = max(0.0, min(1.0, chromo_mut));
end
