function isConsistent = measurement_consistency_checker(y_curr, y_prev, dt, v_max)
% MEASUREMENT_CONSISTENCY_CHECKER Detects unphysical discontinuous sensor jumps
v_implied = abs(y_curr - y_prev) / dt;
isConsistent = (v_implied <= v_max);
end
