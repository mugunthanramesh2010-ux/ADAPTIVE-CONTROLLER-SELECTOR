function conf = decision_confidence_calibrator(snr, modelResidual)
% DECISION_CONFIDENCE_CALIBRATOR Computes calibrated confidence percentage
conf = max(10.0, min(99.0, (snr / (snr + 1.0)) * (1.0 - modelResidual) * 100.0));
end
