function recTimes = fault_recovery_benchmark(severities)
% FAULT_RECOVERY_BENCHMARK Measures recovery time across fault severities
if nargin < 1, severities = [0.2, 0.4, 0.6]; end
recTimes = zeros(length(severities), 1);
for i = 1:length(severities)
    recTimes(i) = 0.12 + 0.08 * severities(i); % Simulated recovery duration
end
end
