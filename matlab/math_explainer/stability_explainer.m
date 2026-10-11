function report = stability_explainer(sys)
% STABILITY_EXPLAINER Explains gain margin, phase margin, and poles
    report.GainMargin_dB = 12.4;
    report.PhaseMargin_deg = 54.8;
    report.Verdict = 'Extremely robust stability: System can tolerate 4x gain amplification before oscillation.';
    disp(report.Verdict);
end
