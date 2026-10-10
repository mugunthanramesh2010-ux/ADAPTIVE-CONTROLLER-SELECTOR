function y_tampered = sensor_bias_attack(y_true, attackMag, t, t_start, t_end)
% SENSOR_BIAS_ATTACK Injects stealthy sensor spoofing bias
if t >= t_start && t <= t_end
    y_tampered = y_true + attackMag;
else
    y_tampered = y_true;
end
end
