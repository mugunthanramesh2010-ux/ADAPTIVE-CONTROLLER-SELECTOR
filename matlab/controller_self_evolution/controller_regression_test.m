function isPassed = controller_regression_test(newGains, baselineRMSE, plant)
% CONTROLLER_REGRESSION_TEST Assures newly evolved candidate does not regress on baseline
newFitness = multiobjective_controller_fitness(controller_genome_encoder(newGains.Kp, newGains.Ki, newGains.Kd, 10, 2), plant);
isPassed = (newFitness <= baselineRMSE * 1.05);
end
