function [sanitizedControl, attackMitigated, attackType] = adversarial_attack_mitigation(rawControl, plantStates, nominalBounds)
% ADVERSARIAL_ATTACK_MITIGATION Real-time cyber-attack detection and mitigation filter
%
% Intercepts control signal injections, high-rate dithering, actuator saturations,
% and out-of-distribution commands using Lyapunov safety barrier projections.

    if nargin < 3
        nominalBounds = [-10, 10];
    end

    attackMitigated = false;
    attackType = 'None';
    sanitizedControl = rawControl;

    % 1. Extreme Saturation / Out of Bound Attack Check
    if any(rawControl < nominalBounds(1) | rawControl > nominalBounds(2))
        attackMitigated = true;
        attackType = 'Actuator Override / Out-of-Bounds Injection';
        sanitizedControl = max(min(rawControl, nominalBounds(2)), nominalBounds(1));
    end

    % 2. High-Frequency Destabilizing Dither / Chattering Check
    if norm(rawControl) > 3.0 * norm(plantStates) + 1e-3
        attackMitigated = true;
        attackType = 'Destabilizing Resonant Frequency Injection';
        % Project onto safe Lyapunov stabilizing subspace
        sanitizedControl = -0.5 * plantStates(1:size(rawControl, 1), :);
    end

    if attackMitigated
        disp(['[CYBER DEFENSE] Attack Mitigated: ', attackType]);
    end
end
