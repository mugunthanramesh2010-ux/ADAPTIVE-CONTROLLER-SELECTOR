function [y_out, buffer] = replay_attack_simulator(y_true, isReplay, buffer, t_rec)
% REPLAY_ATTACK_SIMULATOR Records nominal data and replays stale telemetry during disturbance
if isempty(buffer), buffer = []; end
if ~isReplay
    buffer(end+1) = y_true;
    if length(buffer) > 200, buffer(1) = []; end
    y_out = y_true;
else
    replayIdx = mod(t_rec, length(buffer)) + 1;
    y_out = buffer(replayIdx);
end
end
