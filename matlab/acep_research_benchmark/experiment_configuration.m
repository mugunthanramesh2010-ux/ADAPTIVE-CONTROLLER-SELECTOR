function cfg = experiment_configuration()
% EXPERIMENT_CONFIGURATION Experiment timing and numerical options
cfg = struct('dt', 0.01, 't_final', 4.0, 'solver', 'RK4', 'RandomSeed', 42);
end
