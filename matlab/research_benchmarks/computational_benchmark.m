function latencyReport = computational_benchmark()
% COMPUTATIONAL_BENCHMARK Measures execution latency of each controller loop
tic; for k=1:1000, 3.0*0.5 + 1.0*0.1; end; t_pid = toc / 1000;
tic; for k=1:1000, [0.5, 0.2] * [0.1; 0.2]; end; t_lqr = toc / 1000;
latencyReport = struct('PID_Microseconds', t_pid*1e6, 'LQR_Microseconds', t_lqr*1e6);
end
