function maxDeviation = attack_recovery_benchmark(y_history, r_history)
% ATTACK_RECOVERY_BENCHMARK Measures peak trajectory excursion during cyber incident
maxDeviation = max(abs(y_history - r_history));
end
