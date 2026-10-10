function hypothesis = anomaly_hypothesis_engine(residual, sensorDelta, u_applied)
% ANOMALY_HYPOTHESIS_ENGINE Classifies event into Sensor Fault, Cyber Attack, or Physical Disturbance
if abs(sensorDelta) > 10.0 && abs(u_applied) < 5.0
    hypothesis = 'LIKELY_CYBER_ANOMALY';
elseif residual > 0.35 && abs(sensorDelta) < 2.0
    hypothesis = 'ACTUATOR_GAIN_DEGRADATION';
elseif residual > 0.15
    hypothesis = 'KNOWN_DISTURBANCE';
else
    hypothesis = 'NORMAL_OPERATION';
end
end
