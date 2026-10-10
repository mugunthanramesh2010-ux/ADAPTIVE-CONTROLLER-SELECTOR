function status = test_end_to_end()
% TEST_END_TO_END Master integration test exercising complete autonomous workflow
res = acep_orchestrator();
assert(contains(res.Status, 'SUCCESS'), 'End-to-end run failed');
status = 'PASS';
disp('test_end_to_end: PASS (All stages validated)');
end
