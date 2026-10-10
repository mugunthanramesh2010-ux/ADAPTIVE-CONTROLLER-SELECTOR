function mcStats = monte_carlo_evaluator(N, plant)
% MONTE_CARLO_EVALUATOR Evaluates N stochastic runs over plant parameter uncertainty
if nargin < 1, N = 20; end
if nargin < 2, plant = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0]); end
rmse_trials = zeros(N, 1);
for i = 1:N
    rng(42 + i);
    A_pert = plant.A + diag([0, 0.3*(rand()-0.5)]);
    % Run fast trial
    x = [0; 0]; y_sim = zeros(1, 100);
    for k = 1:100
        e = 1.0 - plant.C * x;
        u = max(-15, min(15, 4.0*e - 1.2*x(2)));
        x = x + 0.01 * (A_pert * x + plant.B * u);
        y_sim(k) = plant.C * x;
    end
    rmse_trials(i) = sqrt(mean((1.0 - y_sim).^2));
end
mcStats = struct('Trials', N, 'MeanRMSE', mean(rmse_trials), 'StdRMSE', std(rmse_trials));
end
