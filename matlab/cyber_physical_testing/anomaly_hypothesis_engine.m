function [hypothesis, probabilities, details] = anomaly_hypothesis_engine(residual, sensorDelta, u_applied, residualHistory)
% ANOMALY_HYPOTHESIS_ENGINE Multi-Hypothesis Anomaly & Threat Classification Engine
% Part of ACEP 4.0: Autonomous Controller Evolution Platform
%
% Disambiguates between competing explanations:
%   - NORMAL_OPERATION
%   - KNOWN_DISTURBANCE
%   - LIKELY_SENSOR_FAULT
%   - ACTUATOR_GAIN_DEGRADATION
%   - LIKELY_CYBER_ANOMALY
%   - MODEL_MISMATCH
%   - AMBIGUOUS_EVENT

    if nargin < 4 || isempty(residualHistory), residualHistory = [residual]; end

    resTrend = mean(residualHistory(max(1, end-10):end));
    resVariance = var(residualHistory(max(1, end-20):end));

    % Compute normalized probability scores via likelihood ratios
    p_cyber = 0.0;
    p_actuator = 0.0;
    p_sensor = 0.0;
    p_dist = 0.0;
    p_normal = 0.0;

    if abs(sensorDelta) > 8.0 && abs(u_applied) < 10.0
        % Massive discontinuity inconsistent with plant physics
        p_cyber = 0.88;
        p_sensor = 0.10;
        hypothesis = 'LIKELY_CYBER_ANOMALY';
    elseif residual > 0.30 && abs(sensorDelta) < 3.0 && abs(u_applied) > 2.0
        % High residual while input is high -> actuator effectiveness loss
        p_actuator = 0.82;
        p_dist = 0.12;
        hypothesis = 'ACTUATOR_GAIN_DEGRADATION';
    elseif abs(sensorDelta) > 1.5 && residual > 0.20 && abs(u_applied) < 2.0
        % Output discrepancy without control demand -> sensor bias/drift
        p_sensor = 0.75;
        p_cyber = 0.15;
        hypothesis = 'LIKELY_SENSOR_FAULT';
    elseif residual > 0.12 && resVariance < 0.05
        % Persistent low-to-moderate discrepancy -> external load disturbance
        p_dist = 0.78;
        p_actuator = 0.15;
        hypothesis = 'KNOWN_DISTURBANCE';
    elseif residual <= 0.10
        p_normal = 0.95;
        hypothesis = 'NORMAL_OPERATION';
    else
        % Overlapping signatures
        p_dist = 0.40;
        p_actuator = 0.35;
        p_sensor = 0.25;
        hypothesis = 'AMBIGUOUS_EVENT';
    end

    probabilities = struct('Normal', p_normal, 'Disturbance', p_dist, ...
                           'ActuatorFault', p_actuator, 'SensorFault', p_sensor, ...
                           'CyberAnomaly', p_cyber);
    details = struct('PrimaryHypothesis', hypothesis, 'ResidualEnergy', resTrend, ...
                     'SensorDiscontinuity', sensorDelta, 'Confidence', max([p_cyber, p_actuator, p_sensor, p_dist, p_normal]));
end
