function regime = operating_regime_classifier(x, u)
% OPERATING_REGIME_CLASSIFIER Classifies operating regime into Linear, Transience, Saturation, or Disturbed
if abs(u) >= 14.8
    regime = 'ACTUATOR_SATURATION_REGIME';
elseif norm(x) > 2.0
    regime = 'LARGE_TRANSIENT_REGIME';
elseif norm(x) < 0.05
    regime = 'NEAR_TRIM_LINEAR_REGIME';
else
    regime = 'NOMINAL_TRACKING_REGIME';
end
end
