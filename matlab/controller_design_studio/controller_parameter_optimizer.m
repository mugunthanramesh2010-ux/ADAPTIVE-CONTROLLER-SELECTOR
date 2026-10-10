function [bestGains, bestCost] = controller_parameter_optimizer(plant, initGains)
% CONTROLLER_PARAMETER_OPTIMIZER Local Nelder-Mead / gradient optimization minimizing ITAE
if nargin < 2 || isempty(initGains), initGains = [3.5, 1.0]; end
dt = 0.01; t = 0:dt:1.5; N = length(t);

costFunc = @(K) eval_itae(K, plant, dt, N, t);
bestGains = initGains;
bestCost = costFunc(bestGains);

% Coordinate pattern search
step = 0.2;
for iter = 1:15
    for dim = 1:2
        K_trial = bestGains;
        K_trial(dim) = K_trial(dim) + step;
        c_trial = costFunc(K_trial);
        if c_trial < bestCost
            bestCost = c_trial; bestGains = K_trial;
        end
    end
    step = step * 0.85;
end
end

function c = eval_itae(K, plant, dt, N, t)
x = [0; 0]; c = 0;
for k = 1:N
    e = 1.0 - plant.C * x;
    u = max(-15, min(15, K(1)*e - K(2)*x(2)));
    x = x + dt * (plant.A * x + plant.B * u);
    c = c + t(k) * abs(e) * dt;
end
end
