function x_pred = twin_state_predictor(A, x, B, u_plan, steps, dt)
% TWIN_STATE_PREDICTOR Multi-step lookahead state trajectory prediction
x_pred = x;
for s = 1:steps
    x_pred = x_pred + dt * (A * x_pred + B * u_plan);
end
end
