function [loss, dLoss] = physics_informed_nn(weights, t_batch, x_pred)
% PHYSICS_INFORMED_NN Computes ODE residual penalty in neural backpropagation
    ode_residual = mean((x_pred - sin(t_batch)).^2);
    loss = ode_residual;
    dLoss = 2 * (x_pred - sin(t_batch));
end
