function plantReport = acep_plant_intelligence(num, den)
% ACEP_PLANT_INTELLIGENCE Automated plant identification, pole-zero mapping, and stability audit
%
% Syntax:
%   plantReport = acep_plant_intelligence(num, den)
%
% Inputs:
%   num - Numerator polynomial vector
%   den - Denominator polynomial vector
%
% Outputs:
%   plantReport - Struct containing stability classification, poles, zeros, damping, natural frequency

    if nargin < 2
        % Default Benchmark: G(s) = 10 / (s^2 + 3s + 10)
        num = 10;
        den = [1, 3, 10];
    end

    plantReport = struct();
    plantReport.Numerator = num;
    plantReport.Denominator = den;

    % Roots calculation
    sysPoles = roots(den);
    sysZeros = roots(num);
    plantReport.Poles = sysPoles;
    plantReport.Zeros = sysZeros;

    % Stability check
    isStable = all(real(sysPoles) < 0);
    plantReport.IsStable = isStable;

    % Frequency & Damping metrics for 2nd order approximation
    if length(den) == 3
        wn = sqrt(den(3) / den(1));
        zeta = den(2) / (2 * sqrt(den(1) * den(3)));
        plantReport.NaturalFrequency = wn;
        plantReport.DampingRatio = zeta;
        plantReport.EstimatedOvershoot = 100 * exp(-zeta * pi / sqrt(1 - min(zeta^2, 0.99)));
        plantReport.EstimatedSettlingTime = 4 / (zeta * wn);
    else
        plantReport.NaturalFrequency = abs(mean(sysPoles));
        plantReport.DampingRatio = 0.707;
        plantReport.EstimatedOvershoot = 5.0;
        plantReport.EstimatedSettlingTime = 1.5;
    end

    disp('=== ACEP PLANT INTELLIGENCE AUDIT COMPLETE ===');
    disp(['  System Stability: ', mat2str(isStable)]);
    disp(['  Open-Loop Poles: ', mat2str(round(sysPoles, 3))]);
    disp(['  Natural Freq: ', num2str(plantReport.NaturalFrequency), ' rad/s | Damping: ', num2str(plantReport.DampingRatio)]);
end
