function classType = attack_vs_disturbance_classifier(chi2, v_implied, v_max)
% ATTACK_VS_DISTURBANCE_CLASSIFIER Disambiguates physical gust from cyber data injection
if v_implied > v_max * 2.0
    classType = 'CYBER_FALSE_DATA_INJECTION';
elseif chi2 > 6.635
    classType = 'UNKNOWN_PHYSICAL_DISTURBANCE';
else
    classType = 'NOMINAL_OPERATION';
end
end
