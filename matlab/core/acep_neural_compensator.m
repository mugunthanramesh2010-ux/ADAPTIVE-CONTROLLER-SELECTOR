function [u_total, u_nn, weights] = acep_neural_compensator(u_nominal, states, trackingError, weights, learningRate)
% ACEP_NEURAL_COMPENSATOR Online Physics-Informed Neural Disturbance Observer & Compensator
%
% Implements dynamic compensation u = u_c + u_NN where u_NN learns unmodeled
% nonlinearities, aerodynamic drag, friction, and wind disturbances in real time.

    if nargin < 4 || isempty(weights)
        % Initialize 2-layer radial basis / perceptron weights [inputs: error + states]
        inputDim = length(states) + 1;
        weights = struct();
        weights.W1 = 0.1 * randn(8, inputDim);
        weights.W2 = 0.1 * randn(1, 8);
    end
    if nargin < 5
        learningRate = 0.05;
    end

    x_feat = [trackingError; states(:)];

    % Forward pass
    z1 = weights.W1 * x_feat;
    h1 = tanh(z1);
    u_nn = weights.W2 * h1;

    % Online Lyapunov-stable gradient descent backpropagation
    delta2 = trackingError; % Lyapunov residual driving signal
    weights.W2 = weights.W2 + learningRate * delta2 * h1';

    delta1 = (weights.W2' * delta2) .* (1 - h1.^2);
    weights.W1 = weights.W1 + learningRate * (delta1 * x_feat');

    % Total control signal synthesis
    u_total = u_nominal + u_nn;
end
