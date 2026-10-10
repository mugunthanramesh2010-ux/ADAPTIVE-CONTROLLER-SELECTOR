function resReplay = twin_fault_replay(twinModel, recordedU, dt)
% TWIN_FAULT_REPLAY Replays recorded control history through twin to isolate plant discrepancy
N = length(recordedU);
x = [0; 0]; y_replay = zeros(1, N);
for k = 1:N
    x = x + dt * (twinModel.A * x + twinModel.B * recordedU(k));
    y_replay(k) = twinModel.C * x;
end
resReplay = y_replay;
end
