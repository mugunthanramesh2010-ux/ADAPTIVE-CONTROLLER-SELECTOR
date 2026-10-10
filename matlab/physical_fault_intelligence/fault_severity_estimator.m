function severity = fault_severity_estimator(residualHistory)
% FAULT_SEVERITY_ESTIMATOR Quantifies fault magnitude from moving-window energy
severity = min(1.0, mean(abs(residualHistory)) / 1.0);
end
