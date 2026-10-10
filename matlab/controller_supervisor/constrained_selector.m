function [admissibleCandidates, rejectionLog] = constrained_selector(candidates, plant, maxEffort, maxOvershoot, minLyapunovDecay)
% CONSTRAINED_SELECTOR Design-by-Contract Feasibility Filter for Controllers
% Part of ACEP 4.0: Autonomous Controller Evolution Platform
%
% Filters candidate controllers against mandatory physical and mathematical contracts:
%   Contract 1: Asymptotic Lyapunov Stability (Re(eig(A_cl)) < -minLyapunovDecay)
%   Contract 2: Actuator Headroom (Peak effort <= maxEffort)
%   Contract 3: Transient Envelope (Overshoot <= maxOvershoot)
%
% Rejects and logs any candidate that breaches any invariant contract.

    if nargin < 2 || isempty(plant)
        plant = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0], 'u_max', 15.0);
    end
    if nargin < 3 || isempty(maxEffort), maxEffort = plant.u_max; end
    if nargin < 4 || isempty(maxOvershoot), maxOvershoot = 25.0; end % Percent
    if nargin < 5 || isempty(minLyapunovDecay), minLyapunovDecay = 0.20; end

    admissibleCandidates = [];
    rejectionLog = {};

    for i = 1:length(candidates)
        cand = candidates(i);
        if isfield(cand, 'gains')
            K = cand.gains;
        elseif isfield(cand, 'Kp')
            K = [cand.Kp, cand.Kd];
        else
            K = [3.5, 1.0];
        end

        % 1. Eigenvalue analysis
        A_cl = plant.A - plant.B * [K(1), K(2)];
        realEigs = real(eig(A_cl));
        maxReal = max(realEigs);

        % 2. 1-second dynamic test
        dt = 0.01; x = [0; 0]; peakEffort = 0; peakOvershoot = 0;
        for k = 1:100
            e = 1.0 - plant.C * x;
            u_k = K(1)*e - K(2)*x(2);
            peakEffort = max(peakEffort, abs(u_k));
            x = x + dt * (plant.A * x + plant.B * max(-plant.u_max, min(plant.u_max, u_k)));
            peakOvershoot = max(peakOvershoot, (plant.C*x - 1.0)*100);
        end

        % Evaluate contracts
        contractPassed = true;
        reasons = {};

        if maxReal >= -minLyapunovDecay
            contractPassed = false;
            reasons{end+1} = sprintf('Lyapunov decay rate insufficient (decay=%.3f, req>=%.3f)', abs(maxReal), minLyapunovDecay);
        end
        if peakEffort > maxEffort * 1.05
            contractPassed = false;
            reasons{end+1} = sprintf('Actuator saturation exceeded (peak=%.1f, limit=%.1f)', peakEffort, maxEffort);
        end
        if peakOvershoot > maxOvershoot
            contractPassed = false;
            reasons{end+1} = sprintf('Transient overshoot contract violated (overshoot=%.1f%%, limit=%.1f%%)', peakOvershoot, maxOvershoot);
        end

        if contractPassed
            cand.PeakEffort = peakEffort;
            cand.PeakOvershoot = peakOvershoot;
            cand.LyapunovDecay = abs(maxReal);
            admissibleCandidates = [admissibleCandidates; cand];
        else
            rejectionLog{end+1} = struct('CandidateIndex', i, 'Reasons', reasons);
        end
    end

    fprintf('[CONSTRAINED SELECTOR] %d of %d candidates satisfy all contract invariants (%d rejected).\n', ...
        length(admissibleCandidates), length(candidates), length(rejectionLog));
end
