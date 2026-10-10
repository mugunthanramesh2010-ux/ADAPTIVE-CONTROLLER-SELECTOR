function isPassed = twin_virtual_commissioning(twinModel, K, dt)
% TWIN_VIRTUAL_COMMISSIONING Tests controller against virtual twin before actual plant deployment
x = [0.5; 0]; isPassed = true;
for k = 1:100
    u = -K * x;
    x = x + dt * (twinModel.A * x + twinModel.B * u);
    if norm(x) > 10.0, isPassed = false; break; end
end
end
