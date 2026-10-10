function y_cf = twin_counterfactual_simulator(twinModel, K_baseline, dt, N)
% TWIN_COUNTERFACTUAL_SIMULATOR Computes trajectory that would have occurred without controller switch
x = [0; 0]; y_cf = zeros(1, N);
for k = 1:N
    e = 1.0 - twinModel.C * x;
    u = K_baseline(1)*e - K_baseline(2)*x(2);
    x = x + dt * (twinModel.A * x + twinModel.B * u);
    y_cf(k) = twinModel.C * x;
end
end
