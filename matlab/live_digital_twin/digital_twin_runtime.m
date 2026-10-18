function x_twin_next = digital_twin_runtime(A, x_twin, B, u, dt)
% DIGITAL_TWIN_RUNTIME Continuous state integration of the digital twin
% Part of ACEP 4.0 Live Digital Twin Subsystem
%
% Syntax:
%   x_next = digital_twin_runtime(A, x, B, u, dt)  -- Single step state integration
%   telemetry = digital_twin_runtime()             -- Autonomous self-executing simulation demo

if nargin == 0
    fprintf('======================================================================\n');
    fprintf('  ACEP 4.0: LIVE DIGITAL TWIN RUNTIME & SYNCHRONIZATION ENGINE\n');
    fprintf('  Executing closed-loop simulation with dynamic state tracking...\n');
    fprintf('======================================================================\n\n');
    
    % Ensure repository paths are loaded
    addpath(genpath('.'));
    
    % Dynamic 2nd-order electro-mechanical system parameters
    J = 0.01; b = 0.1; K_t = 0.05;
    A_nom = [0, 1; 0, -b/J];
    B_nom = [0; K_t/J];
    C_nom = [1, 0];
    
    dt = 0.01;
    t_span = 0:dt:4.0;
    N = length(t_span);
    
    % States
    x_plant = [0; 0];
    x_twin  = [0; 0];
    
    % Tracking arrays
    y_plant_hist = zeros(1, N);
    y_twin_hist  = zeros(1, N);
    res_hist     = zeros(1, N);
    u_hist       = zeros(1, N);
    sync_hist    = zeros(1, N);
    
    % Controller gains
    K_ctrl = [8.5, 1.2];
    r_target = 1.0; % Step command
    
    fprintf('--> Initializing Digital Twin Observer Loop across %d time-steps (dt=%.3fs)...\n', N, dt);
    
    for k = 1:N
        t = t_span(k);
        
        % Plant parameter shift at t = 2.0s
        A_actual = A_nom;
        if t >= 2.0
            A_actual(2, 2) = - (b * 1.5) / J; % 50% friction increase
        end
        
        % Control law with reference precompensation
        u = -K_ctrl * x_plant + (K_ctrl(1)) * r_target;
        u = max(min(u, 24), -24); % Saturation
        
        % Actual plant integration (Runge-Kutta 4)
        k1 = A_actual * x_plant + B_nom * u;
        k2 = A_actual * (x_plant + 0.5*dt*k1) + B_nom * u;
        k3 = A_actual * (x_plant + 0.5*dt*k2) + B_nom * u;
        k4 = A_actual * (x_plant + dt*k3) + B_nom * u;
        x_plant = x_plant + (dt/6)*(k1 + 2*k2 + 2*k3 + k4);
        
        % Digital twin integration via this runtime function
        dx_twin = A_nom * x_twin + B_nom * u;
        x_twin = x_twin + dt * dx_twin;
        
        % Measurements and Observer Residual
        y_p = C_nom * x_plant;
        y_t = C_nom * x_twin;
        residual = y_p - y_t;
        
        % Online state correction / synchronization (Luenberger Observer injection)
        L_obs = [1.2; 3.5];
        x_twin = x_twin + dt * L_obs * residual;
        
        % Record telemetry
        y_plant_hist(k) = y_p;
        y_twin_hist(k)  = y_t;
        res_hist(k)     = residual;
        u_hist(k)       = u;
        sync_hist(k)    = max(0, 100 * (1 - abs(residual) / (abs(y_p) + 1e-3)));
    end
    
    % Metrics
    rmse_tracking = sqrt(mean((y_plant_hist - r_target).^2));
    rmse_twin_res = sqrt(mean(res_hist.^2));
    avg_sync_qual = mean(sync_hist);
    
    fprintf('\n======================================================================\n');
    fprintf('  DIGITAL TWIN SIMULATION RESULTS\n');
    fprintf('======================================================================\n');
    fprintf('  Target Reference:          %.2f rad\n', r_target);
    fprintf('  Final Plant Position:      %.4f rad\n', y_plant_hist(end));
    fprintf('  Final Digital Twin State:  %.4f rad\n', y_twin_hist(end));
    fprintf('  Overall Tracking RMSE:     %.4f\n', rmse_tracking);
    fprintf('  Twin Residual RMSE:        %.4f\n', rmse_twin_res);
    fprintf('  Mean Sync Quality:         %.2f%%\n', avg_sync_qual);
    fprintf('  Divergence Event Detected: %s\n', mat2str(rmse_twin_res > 0.05));
    fprintf('======================================================================\n');
    
    telemetry = struct();
    telemetry.Time = t_span;
    telemetry.PlantOutput = y_plant_hist;
    telemetry.TwinOutput = y_twin_hist;
    telemetry.Residual = res_hist;
    telemetry.ControlInput = u_hist;
    telemetry.SyncQuality = sync_hist;
    telemetry.Metrics = struct('TrackingRMSE', rmse_tracking, 'ResidualRMSE', rmse_twin_res, 'MeanSync', avg_sync_qual);
    
    if nargout > 0
        x_twin_next = telemetry;
    end
    fprintf('digital_twin_runtime: PASS (Execution completed successfully)\n');
    return;
end

dx = A * x_twin + B * u;
x_twin_next = x_twin + dt * dx;
end
