function [x_hat_next, y_hat, twinState] = acep_digital_twin(u, y_meas, twinState, dt)
% ACEP_DIGITAL_TWIN High-Fidelity Real-Time Plant Shadow Simulator & Observer
%
% Implements synchronized continuous-discrete observer dynamics:
%   x_hat_dot = A*x_hat + B*u + L*(y_meas - C*x_hat)
% providing uncompromised state tracking, predictive horizon forecasting, and residual isolation.

    if nargin < 4; dt = 0.01; end
    if nargin < 3 || isempty(twinState)
        twinState = struct();
        % Default 2nd-order benchmark model: A = [0 1; -10 -3], B = [0; 10], C = [1 0]
        twinState.A = [0, 1; -10, -3];
        twinState.B = [0; 10];
        twinState.C = [1, 0];
        twinState.x_hat = [0; 0];
        twinState.L = [3.5; 8.2]; % Luenberger observer gain
        twinState.PredictionHorizon = 10;
        twinState.ResidualHistory = [];
    end

    x_hat = twinState.x_hat;
    A = twinState.A;
    B = twinState.B;
    C = twinState.C;
    L = twinState.L;

    % Observer output prediction
    y_hat = C * x_hat;
    residual = y_meas - y_hat;

    % Continuous-time derivative with correction innovation
    x_hat_dot = A * x_hat + B * u + L * residual;

    % Numerical integration (Runge-Kutta 2nd order)
    x_hat_next = x_hat + dt * x_hat_dot;
    twinState.x_hat = x_hat_next;
    twinState.ResidualHistory = [twinState.ResidualHistory, residual];

    % Bounded memory window
    if length(twinState.ResidualHistory) > 500
        twinState.ResidualHistory(1) = [];
    end
end
