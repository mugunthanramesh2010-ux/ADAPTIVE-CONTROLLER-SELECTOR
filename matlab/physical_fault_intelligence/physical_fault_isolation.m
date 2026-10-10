function faultClass = physical_fault_isolation(r_sensor, r_actuator, r_thermal)
% PHYSICAL_FAULT_ISOLATION Directional residual signature isolation
if r_thermal > 0.5
    faultClass = 'THERMAL_OVERHEATING_FAULT';
elseif r_actuator > 0.35 && r_sensor < 0.15
    faultClass = 'ACTUATOR_GAIN_DEGRADATION';
elseif r_sensor > 0.30
    faultClass = 'SENSOR_CALIBRATION_FAULT';
else
    faultClass = 'NORMAL_OR_UNRESOLVED';
end
end
