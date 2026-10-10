function log = cyber_incident_timeline(log, t, eventType)
% CYBER_INCIDENT_TIMELINE Records timestamped event into cyber incident log
if isempty(log), log = {}; end
log{end+1} = struct('Time', t, 'Event', eventType);
end
