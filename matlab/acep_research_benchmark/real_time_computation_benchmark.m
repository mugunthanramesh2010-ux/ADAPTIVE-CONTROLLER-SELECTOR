function execTime = real_time_computation_benchmark(numIter)
% REAL_TIME_COMPUTATION_BENCHMARK Measures CPU execution latency per control loop cycle
if nargin < 1, numIter = 1000; end
A = [0 1; -10 -3]; B = [0; 10]; K = [4.5, 1.2]; x = [0.5; 0.2];
tic;
for i = 1:numIter
    u = K(1)*(1.0 - x(1)) - K(2)*x(2);
    x = x + 0.01 * (A * x + B * u);
end
tot = toc;
execTime = struct('TotalTimeSec', tot, 'MicrosecondsPerStep', (tot / numIter) * 1e6);
end
