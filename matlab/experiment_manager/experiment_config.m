function config = experiment_config()
% EXPERIMENT_CONFIG Structured reproducibility settings with fixed random seeds
config = struct();
config.RandomSeed = 42;
config.SampleTime = 0.01;
config.Duration = 5.0;
config.Plant = 'Quadrotor';
config.Solver = 'Euler-Forward';
end
