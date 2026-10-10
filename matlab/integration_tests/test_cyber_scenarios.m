function status = test_cyber_scenarios()
% TEST_CYBER_SCENARIOS Unit test for false-data injection detection
fdi = anomaly_hypothesis_engine(0.05, 50.0, 1.0);
assert(strcmp(fdi, 'LIKELY_CYBER_ANOMALY'), 'Cyber attack detection failure');
status = 'PASS';
disp('test_cyber_scenarios: PASS');
end
