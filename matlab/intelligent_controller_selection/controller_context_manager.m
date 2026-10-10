function context = controller_context_manager(health, disturbanceMagnitude, cyberStatus)
% CONTROLLER_CONTEXT_MANAGER Manages ambient operational environment state
context = struct('ActuatorHealth', health, 'DisturbanceLevel', disturbanceMagnitude, ...
                 'CyberAlert', cyberStatus, 'Timestamp', char(datetime('now')));
end
