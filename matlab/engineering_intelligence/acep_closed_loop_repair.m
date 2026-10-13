function [repairedCtrl, repairLog] = acep_closed_loop_repair(plantSpec, candidateCtrl, failedMetrics)
% ACEP_CLOSED_LOOP_REPAIR Autonomous failure diagnosis and bounded parameter repair
% Part of ACEP Next-Generation AI Engineering Intelligence Platform
%
% Implements the closed-loop self-healing cycle:
% Observe actual results -> Compare against requirements -> Identify failure mode ->
% Form testable correction hypothesis -> Apply bounded change -> Rerun simulation ->
% Compare against baseline -> Accept or reject change.

if nargin < 3
    error('acep_closed_loop_repair requires plantSpec, candidateCtrl, failedMetrics');
end

repairLog = struct();
repairLog.initial_metrics = failedMetrics;
repairLog.trials = {};
repairLog.accepted = false;

% 1. Classify Failure Mode
failure_modes = {};
if isfield(failedMetrics, 'overshoot_pct') && failedMetrics.overshoot_pct > plantSpec.requirements.overshoot_max
    failure_modes{end+1} = 'EXCESSIVE_OVERSHOOT';
end
if isfield(failedMetrics, 'settling_time_sec') && failedMetrics.settling_time_sec > plantSpec.requirements.settling_time_target
    failure_modes{end+1} = 'SLOW_SETTLING_TIME';
end

if isempty(failure_modes)
    repairedCtrl = candidateCtrl;
    repairLog.status = 'NO_REPAIR_NEEDED';
    return;
end

currentCtrl = candidateCtrl;
bestMetrics = failedMetrics;
max_iterations = 4;

A = plantSpec.plant.A;
B = plantSpec.plant.B;
C = plantSpec.plant.C;
dt = plantSpec.simulation.dt;
t_vec = plantSpec.simulation.time_vector;
N = length(t_vec);
ref = plantSpec.simulation.reference_profile;
u_max = plantSpec.plant.u_max;

for iter = 1:max_iterations
    trial = struct();
    trial.iteration = iter;
    trial.primary_failure = failure_modes{1};
    
    % 2. Formulate Testable Correction Hypothesis
    switch failure_modes{1}
        case 'EXCESSIVE_OVERSHOOT'
            % Hypothesis: Increasing derivative gain Kd increases damping ratio zeta
            % while slightly reducing proportional gain Kp reduces peak overshoot.
            scale_Kd = 1.0 + (0.35 * iter);
            scale_Kp = max(0.6, 1.0 - (0.08 * iter));
            hypothesis = sprintf('Increase Kd by %.0f%% and attenuate Kp by %.0f%% to boost closed-loop damping', ...
                (scale_Kd - 1)*100, (1 - scale_Kp)*100);
            
            testCtrl = currentCtrl;
            testCtrl.Kd = testCtrl.Kd * scale_Kd;
            testCtrl.Kp = testCtrl.Kp * scale_Kp;
            
        case 'SLOW_SETTLING_TIME'
            % Hypothesis: Increasing proportional gain Kp increases natural frequency wn,
            % accelerating convergence towards reference.
            scale_Kp = 1.0 + (0.25 * iter);
            hypothesis = sprintf('Increase Kp by %.0f%% to increase closed-loop bandwidth', (scale_Kp - 1)*100);
            
            testCtrl = currentCtrl;
            testCtrl.Kp = testCtrl.Kp * scale_Kp;
            testCtrl.Ki = testCtrl.Ki * 1.15;
            
        otherwise
            break;
    end
    
    trial.hypothesis = hypothesis;
    
    % 3. Rerun Numerical Simulation
    x = zeros(size(A, 1), 1);
    int_e = 0; prev_e = 0;
    y_sim = zeros(1, N);
    u_sim = zeros(1, N);
    
    for k = 1:N
        y_k = C * x;
        y_sim(k) = y_k;
        e_k = ref - y_k;
        int_e = int_e + e_k * dt;
        de_k = (e_k - prev_e) / dt;
        prev_e = e_k;
        
        u_raw = testCtrl.Kp * e_k + testCtrl.Ki * int_e + testCtrl.Kd * de_k;
        u_k = max(-u_max, min(u_max, u_raw));
        u_sim(k) = u_k;
        
        % RK4 step
        k1 = A * x + B * u_k;
        k2 = A * (x + 0.5 * dt * k1) + B * u_k;
        k3 = A * (x + 0.5 * dt * k2) + B * u_k;
        k4 = A * (x + dt * k3) + B * u_k;
        x = x + (dt / 6) * (k1 + 2*k2 + 2*k3 + k4);
    end
    
    peak_y = max(y_sim);
    overshoot_new = max(0, ((peak_y - ref) / ref) * 100);
    
    ss_band = 0.02 * ref;
    idx_band = find(abs(y_sim - ref) > ss_band, 1, 'last');
    if isempty(idx_band), Ts_new = 0; else, Ts_new = t_vec(min(N, idx_band + 1)); end
    
    rmse_new = sqrt(mean((ref - y_sim).^2));
    
    trial.metrics = struct('overshoot_pct', overshoot_new, 'settling_time_sec', Ts_new, 'rmse', rmse_new);
    
    % 4. Quantitative Acceptance Criterion
    is_improved = false;
    if strcmp(failure_modes{1}, 'EXCESSIVE_OVERSHOOT') && (overshoot_new < bestMetrics.overshoot_pct)
        is_improved = true;
    elseif strcmp(failure_modes{1}, 'SLOW_SETTLING_TIME') && (Ts_new < bestMetrics.settling_time_sec)
        is_improved = true;
    end
    
    trial.accepted = is_improved;
    repairLog.trials{end+1} = trial;
    
    if is_improved
        currentCtrl = testCtrl;
        bestMetrics = trial.metrics;
        repairLog.accepted = true;
        
        % Check if all targets are now met
        if bestMetrics.overshoot_pct <= (plantSpec.requirements.overshoot_max + 1.0) && ...
           bestMetrics.settling_time_sec <= (plantSpec.requirements.settling_time_target * 1.2)
            break;
        end
    end
end

repairedCtrl = currentCtrl;
repairLog.final_metrics = bestMetrics;
repairLog.iterations_evaluated = length(repairLog.trials);

end
