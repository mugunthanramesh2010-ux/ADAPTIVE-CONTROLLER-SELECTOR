function compTable = controller_design_comparison(candidates, plant)
% CONTROLLER_DESIGN_COMPARISON Runs dynamic comparative benchmark across all candidates
dt = 0.01; t = 0:dt:2.0; N = length(t);
nCand = length(candidates);
names = cell(nCand, 1);
rmseVec = zeros(nCand, 1);
overshootVec = zeros(nCand, 1);

for i = 1:nCand
    cand = candidates{i};
    names{i} = cand.Name;
    K = cand.Gains;
    x = [0; 0]; y_sim = zeros(1, N);
    for k = 1:N
        e = 1.0 - plant.C * x;
        u = max(-15, min(15, K(1)*e - K(2)*x(2)));
        x = x + dt * (plant.A * x + plant.B * u);
        y_sim(k) = plant.C * x;
    end
    rmseVec(i) = sqrt(mean((1.0 - y_sim).^2));
    overshootVec(i) = max(0, (max(y_sim) - 1.0) * 100);
end

compTable = table(names, rmseVec, overshootVec, 'VariableNames', {'Candidate', 'RMSE', 'Overshoot_Percent'});
end
