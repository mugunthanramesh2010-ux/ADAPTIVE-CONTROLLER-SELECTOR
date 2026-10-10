function confidence = twin_confidence_estimator(residualHistory)
% TWIN_CONFIDENCE_ESTIMATOR Calculates statistical synchronization confidence percentage
rmse = sqrt(mean(residualHistory.^2));
confidence = max(0, min(100, (1.0 - rmse / 2.0) * 100));
end
