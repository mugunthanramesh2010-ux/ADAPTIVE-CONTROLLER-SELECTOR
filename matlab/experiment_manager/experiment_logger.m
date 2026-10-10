function logger = experiment_logger()
% EXPERIMENT_LOGGER In-memory telemetry and event trajectory buffer
logger = struct('t', [], 'y', [], 'u', [], 'r', [], 'residuals', [], 'events', {{}});
end
