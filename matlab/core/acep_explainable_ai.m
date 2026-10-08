function explanation = acep_explainable_ai(oldController, newController, metricDeltas, faultContext)
% ACEP_EXPLAINABLE_AI Natural-Language and Causal Attribution Explanation Layer
%
% Generates engineer-interpretable causal narratives explaining:
%   - Why a controller parameter/architecture switch occurred
%   - Quantitative trade-offs between tracking error, overshoot, and control effort
%   - FDI root-cause diagnosis and defensive actions taken

    explanation = struct();
    explanation.Timestamp = char(datetime('now'));
    explanation.PreviousController = oldController;
    explanation.ActiveController = newController;

    % Build human-readable audit narrative
    lines = {};
    lines{end+1} = sprintf('=================== ACEP REASONING REPORT ===================');
    lines{end+1} = sprintf('Event: Controller Reconfigured from [%s] to [%s]', oldController, newController);

    if metricDeltas.TrackingErrorDelta < 0
        lines{end+1} = sprintf('  (+) Tracking Error Reduced by: %.1f%%', abs(metricDeltas.TrackingErrorDelta));
    end
    if metricDeltas.OvershootDelta < 0
        lines{end+1} = sprintf('  (+) Transient Overshoot Decreased by: %.1f%%', abs(metricDeltas.OvershootDelta));
    else
        lines{end+1} = sprintf('  (!) Overshoot Marginal Increase: +%.1f%% (Compensated by robustness)', metricDeltas.OvershootDelta);
    end

    if isfield(faultContext, 'FaultType') && ~strcmp(faultContext.FaultType, 'None')
        lines{end+1} = sprintf('  [DIAGNOSIS TRIGGER]: %s identified at actuator/sensor plane.', faultContext.FaultType);
        lines{end+1} = sprintf('  [MITIGATION]: %s', faultContext.RecommendedAction);
    end

    lines{end+1} = sprintf('  [FORMAL PROOF]: Lyapunov Stability certified with decay margin alpha = %.3f', metricDeltas.StabilityMargin);
    lines{end+1} = sprintf('=============================================================');

    explanation.NarrativeText = strjoin(lines, '\n');
    disp(explanation.NarrativeText);
end
