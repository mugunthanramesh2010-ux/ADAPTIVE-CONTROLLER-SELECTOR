function [u, phaseBoost] = self_tuning_lead(e, targetPhaseMargin)
% SELF_TUNING_LEAD Adaptive Phase-Lead Compensator
    a = (1 + sin(deg2rad(targetPhaseMargin))) / (1 - sin(deg2rad(targetPhaseMargin)));
    phaseBoost = targetPhaseMargin;
    u = a * e;
    disp(['Self-Tuning Lead: Phase Boost = ', num2str(phaseBoost), ' deg']);
end
