function [child1, child2] = controller_crossover_engine(parent1, parent2, eta)
% CONTROLLER_CROSSOVER_ENGINE Simulated Binary Crossover (SBX) operator
if nargin < 3, eta = 2.0; end
u = rand(size(parent1));
beta = zeros(size(parent1));
beta(u <= 0.5) = (2 * u(u <= 0.5)).^(1 / (eta + 1));
beta(u > 0.5)  = (1 ./ (2 * (1 - u(u > 0.5)))).^(1 / (eta + 1));
child1 = 0.5 * ((1 + beta) .* parent1 + (1 - beta) .* parent2);
child2 = 0.5 * ((1 - beta) .* parent1 + (1 + beta) .* parent2);
child1 = max(0.0, min(1.0, child1));
child2 = max(0.0, min(1.0, child2));
end
