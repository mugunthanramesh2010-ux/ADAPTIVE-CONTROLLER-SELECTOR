function pop = controller_candidate_population(popSize)
% CONTROLLER_CANDIDATE_POPULATION Initializes population of hybrid chromosome vectors
if nargin < 1 || isempty(popSize), popSize = 20; end
pop = cell(popSize, 1);
for i = 1:popSize
    pop{i} = rand(1, 5); % [Kp, Ki, Kd, Q_weight, smc_gain]
end
end
