function expData = twin_experiment_recorder(t, yp, yt, u, r)
% TWIN_EXPERIMENT_RECORDER Formats experiment channels into reproducible record
expData = struct('Time', t, 'PlantOutput', yp, 'TwinOutput', yt, 'Control', u, 'Reference', r);
end
