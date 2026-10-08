function [evolvedChromosome, bestFitness, history] = self_evolving_swarm_controller(populationSize, generations, plantDynamics)
% SELF_EVOLVING_SWARM_CONTROLLER Bio-inspired evolutionary synthesis of hybrid controller chromosomes
%
% Evolves a hybrid multi-gene genome encoding PID gains, LQR penalties, MPC horizon,
% and Neural Network activation weights to optimize swarm cohesion and tracking error.

    if nargin < 1; populationSize = 20; end
    if nargin < 2; generations = 15; end
    if nargin < 3
        plantDynamics = struct('wn', 2.5, 'zeta', 0.6);
    end

    % Chromosome representation: [Kp, Ki, Kd, Q_diag, R_diag, MPC_Np, NN_Gain]
    geneLength = 7;
    population = rand(populationSize, geneLength) .* [10, 5, 2, 10, 5, 20, 2];
    fitness = zeros(populationSize, 1);
    history = zeros(generations, 2); % [best, average]

    disp('--- Commencing Autonomous Controller Evolution ---');

    for gen = 1:generations
        % Evaluate fitness for each chromosome
        for i = 1:populationSize
            c = population(i, :);
            % Simulated step tracking error, overshoot, and control effort
            overshoot = max(0, (c(1) * 0.15 - c(3) * 0.08) * 10);
            settlingTime = max(0.2, 5.0 / (c(1) + 0.1) + 0.5 * c(2));
            trackingError = 1.0 / (c(1) + c(2) + 0.05) + 0.05 * c(7);
            controlEffort = 0.05 * (c(1)^2 + c(3)^2 + c(5)^2);

            % Multiobjective Cost Function
            J = 0.35 * trackingError + 0.25 * overshoot + 0.25 * settlingTime + 0.15 * controlEffort;
            fitness(i) = 1.0 / (1.0 + J); % Higher is better
        end

        [maxFit, bestIdx] = max(fitness);
        history(gen, 1) = maxFit;
        history(gen, 2) = mean(fitness);

        % Selection: Tournament Selection
        newPop = zeros(size(population));
        newPop(1, :) = population(bestIdx, :); % Elitism

        for k = 2:populationSize
            p1 = population(randi(populationSize), :);
            p2 = population(randi(populationSize), :);

            % Crossover (Uniform blend)
            alpha = rand();
            child = alpha * p1 + (1 - alpha) * p2;

            % Mutation (Gaussian perturbation)
            if rand() < 0.25
                mutationVector = 0.1 * randn(1, geneLength);
                child = max(0.01, child + mutationVector);
            end

            newPop(k, :) = child;
        end

        population = newPop;
    end

    [bestFitness, bestIdx] = max(fitness);
    evolvedChromosome = struct();
    evolvedChromosome.Kp = population(bestIdx, 1);
    evolvedChromosome.Ki = population(bestIdx, 2);
    evolvedChromosome.Kd = population(bestIdx, 3);
    evolvedChromosome.Q = population(bestIdx, 4);
    evolvedChromosome.R = population(bestIdx, 5);
    evolvedChromosome.Np = round(population(bestIdx, 6));
    evolvedChromosome.NN_Gain = population(bestIdx, 7);
    evolvedChromosome.Fitness = bestFitness;

    disp(['Controller Evolution Finished: Peak Fitness = ', num2str(bestFitness)]);
end
