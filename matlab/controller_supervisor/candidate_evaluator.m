function [rankedCandidates, evaluationScores] = candidate_evaluator(candidates, plant, weights)
% CANDIDATE_EVALUATOR Multi-Objective Normalized Controller Candidate Evaluator
% Part of ACEP 4.0: Autonomous Controller Evolution Platform
%
% Evaluates candidate controllers using a normalized, configurable objective function:
%   J(theta) = w_e * J_tracking + w_u * J_effort + w_o * J_overshoot 
%            + w_s * J_settling + w_r * J_robustness + w_c * J_computation + w_f * J_recovery
%
% Rejects any candidate violating mandatory physical constraints.

    if nargin < 2 || isempty(plant)
        plant = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0], 'u_max', 15.0);
    end
    if nargin < 3 || isempty(weights)
        weights = struct('w_e', 0.30, 'w_u', 0.15, 'w_o', 0.15, ...
                         'w_s', 0.15, 'w_r', 0.15, 'w_c', 0.05, 'w_f', 0.05);
    end

    n = length(candidates);
    evaluationScores = zeros(n, 1);
    metrics = cell(n, 1);

    for i = 1:n
        cand = candidates(i);
        
        % Extract gains
        if isfield(cand, 'gains')
            K = cand.gains;
        elseif isfield(cand, 'Kp')
            K = [cand.Kp, cand.Kd];
        else
            K = [3.5, 1.0];
        end

        % Closed-loop dynamics
        A_cl = plant.A - plant.B * [K(1), K(2)];
        eigs_cl = eig(A_cl);
        maxRealEig = max(real(eigs_cl));

        % Stability Check
        isStable = (maxRealEig < -1e-4);
        decayRate = abs(maxRealEig);

        % Numerical 1.0s simulation to measure true tracking, effort, overshoot
        dt = 0.01; t_eval = 0:dt:1.5; N_eval = length(t_eval);
        x = [0; 0];
        y_sim = zeros(1, N_eval);
        u_sim = zeros(1, N_eval);
        r_step = 1.0;

        for k = 1:N_eval
            e = r_step - plant.C * x;
            u_k = K(1) * e - K(2) * x(2);
            u_k = max(-plant.u_max, min(plant.u_max, u_k));
            x = x + dt * (plant.A * x + plant.B * u_k);
            y_sim(k) = plant.C * x;
            u_sim(k) = u_k;
        end

        % Compute Normalized Metrics
        j_tracking = sqrt(mean((r_step - y_sim).^2)) / 1.0; % Normalized by step magnitude
        j_effort   = sqrt(mean(u_sim.^2)) / plant.u_max;    % Normalized by actuator limit
        j_overshoot= max(0, (max(y_sim) - 1.0));            % Normalized overshoot fraction
        
        % Settling time calculation (2% band)
        settleIdx = find(abs(y_sim - 1.0) > 0.02, 1, 'last');
        if isempty(settleIdx)
            j_settling = 0.2;
        else
            j_settling = min(1.0, t_eval(settleIdx) / 1.5);
        end

        j_robustness = exp(-decayRate); % Lower is better (higher decay rate)
        j_computation = 0.05 * (length(fieldnames(cand))); % Proxy for parameter complexity
        j_recovery    = j_tracking * 1.1;

        if ~isStable
            % Disqualify unstable candidate with extreme penalty
            totalScore = 1e6;
        else
            totalScore = weights.w_e * j_tracking + ...
                         weights.w_u * j_effort + ...
                         weights.w_o * j_overshoot + ...
                         weights.w_s * j_settling + ...
                         weights.w_r * j_robustness + ...
                         weights.w_c * j_computation + ...
                         weights.w_f * j_recovery;
        end

        evaluationScores(i) = totalScore;
        metrics{i} = struct('TrackingRMSE', j_tracking, 'EffortRMS', j_effort, ...
                            'Overshoot', j_overshoot * 100, 'SettlingTime', j_settling * 1.5, ...
                            'StabilityDecay', decayRate, 'IsStable', isStable, ...
                            'TotalCost', totalScore);
    end

    % Rank from lowest cost to highest
    [sortedScores, rankIndices] = sort(evaluationScores, 'ascend');
    rankedCandidates = candidates(rankIndices);

    fprintf('[CANDIDATE EVALUATOR] Evaluated %d candidates. Best score: J = %.4f (Candidate #%d)\n', ...
        n, sortedScores(1), rankIndices(1));
end
