function syncPct = twin_sync_quality_monitor(rmse)
% TWIN_SYNC_QUALITY_MONITOR Computes 0-100% synchronization confidence index
syncPct = max(0.0, min(100.0, (1.0 - rmse / 1.0) * 100.0));
end
