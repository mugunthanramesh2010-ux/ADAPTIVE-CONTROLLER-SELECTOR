function isCompliant = actuator_limit_verifier(u_peak, u_max)
% ACTUATOR_LIMIT_VERIFIER Checks whether peak actuator effort complies with physical saturation
isCompliant = (u_peak <= u_max);
end
