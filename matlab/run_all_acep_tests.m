%% RUN_ALL_ACEP_TESTS Master Automated Regression & Integration Test Suite
% Part of ACEP 4.0 Autonomous Control Engineering Ecosystem
%
% Executes all 7 verification and validation suites:
%   1. test_end_to_end
%   2. test_controller_pipeline
%   3. test_adaptation
%   4. test_fault_recovery
%   5. test_cyber_scenarios
%   6. test_verification_gate
%   7. test_engineering_intelligence

clear; clc;
addpath(genpath('.'));

fprintf('======================================================================\n');
fprintf('  ACEP: RUNNING ALL 7 AUTOMATED INTEGRATION & VERIFICATION TESTS\n');
fprintf('======================================================================\n\n');

tests = { ...
    'test_end_to_end', ...
    'test_controller_pipeline', ...
    'test_adaptation', ...
    'test_fault_recovery', ...
    'test_cyber_scenarios', ...
    'test_verification_gate', ...
    'test_engineering_intelligence' ...
};

results = struct('Test', {}, 'Status', {}, 'DurationSec', {});
allPass = true;

for i = 1:length(tests)
    testName = tests{i};
    fprintf('[RUNNING %d/%d] %s...\n', i, length(tests), testName);
    tStart = tic;
    try
        status = feval(testName);
        tElapsed = toc(tStart);
        results(i).Test = testName;
        results(i).Status = 'PASS';
        results(i).DurationSec = tElapsed;
        fprintf('  --> %s: PASS (%.2fs)\n\n', testName, tElapsed);
    catch ME
        tElapsed = toc(tStart);
        results(i).Test = testName;
        results(i).Status = ['FAIL: ', ME.message];
        results(i).DurationSec = tElapsed;
        allPass = false;
        fprintf('  --> %s: FAIL (%.2fs) - %s\n\n', testName, tElapsed, ME.message);
    end
end

fprintf('======================================================================\n');
fprintf('  ACEP TEST SUMMARY REPORT\n');
fprintf('======================================================================\n');
fprintf('%-32s | %-10s | %-10s\n', 'Test Suite', 'Status', 'Time (s)');
fprintf('----------------------------------------------------------------------\n');
for i = 1:length(results)
    fprintf('%-32s | %-10s | %-8.2f\n', results(i).Test, results(i).Status, results(i).DurationSec);
end
fprintf('----------------------------------------------------------------------\n');

if allPass
    fprintf('OVERALL VERDICT: ALL TESTS PASSED (7/7 Verified)\n\n');
else
    fprintf('OVERALL VERDICT: SOME TESTS FAILED\n\n');
    error('ACEP Integration Test Suite encountered failures.');
end
