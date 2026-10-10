function source = disturbance_source_explainer(freqSpectrum)
% DISTURBANCE_SOURCE_EXPLAINER Classifies disturbance into aerodynamic, mechanical, or random
if freqSpectrum.PeakFreq < 1.0
    source = 'LOW_FREQUENCY_AERODYNAMIC_GUST';
elseif freqSpectrum.PeakFreq < 10.0
    source = 'PERIODIC_MECHANICAL_UNBALANCE';
else
    source = 'HIGH_FREQUENCY_SENSOR_CHIRP';
end
end
