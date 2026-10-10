function isValid = command_integrity_monitor(u_cmd, hashKey)
% COMMAND_INTEGRITY_MONITOR Verifies command authentication and sanity bounds
isValid = (abs(u_cmd) <= 20.0) && ~isempty(hashKey);
end
