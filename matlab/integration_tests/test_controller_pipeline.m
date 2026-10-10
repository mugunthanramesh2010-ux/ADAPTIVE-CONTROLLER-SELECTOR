function status = test_controller_pipeline()
% TEST_CONTROLLER_PIPELINE Unit test for candidate controller generation and scoring
plant = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0], 'D', 0);
res = acep_orchestrator(plant, 'PID');
assert(res.RMSE < 0.40, 'PID RMSE exceeded tolerance');
status = 'PASS';
disp('test_controller_pipeline: PASS');
end
