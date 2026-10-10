function sweepRes = uncertainty_sweep(uncertaintyLevels, plant)
% UNCERTAINTY_SWEEP Sweeps plant parameter variations from 0 to 50%
if nargin < 1, uncertaintyLevels = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5]; end
if nargin < 2, plant = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0]); end
n = length(uncertaintyLevels);
rmseOut = zeros(n, 1);
for i = 1:n
    uLvl = uncertaintyLevels(i);
    A_sw = plant.A * (1 + uLvl);
    x = [0; 0]; y_sim = zeros(1, 100);
    for k = 1:100
        e = 1.0 - plant.C * x;
        u = max(-15, min(15, 4.5*e - 1.2*x(2)));
        x = x + 0.01 * (A_sw * x + plant.B * u);
        y_sim(k) = plant.C * x;
    end
    rmseOut(i) = sqrt(mean((1.0 - y_sim).^2));
end
sweepRes = table(uncertaintyLevels', rmseOut, 'VariableNames', {'UncertaintyFraction', 'RMSE'});
end
