function status = test_engineering_intelligence()
% TEST_ENGINEERING_INTELLIGENCE Automated unit and integration test for AI engineering intelligence
% Part of ACEP 4.0 Suite

fprintf('--> Running test_engineering_intelligence...\n');
addpath(genpath(pwd));

% 1. Test Requirements Interview Engine
prompt = 'Design high bandwidth speed controller for brushless DC motor with overshoot under 8 percent';
[interview, nextQ] = acep_requirements_interview_engine(prompt);
assert(~isempty(interview.candidate_questions), 'Failed to extract candidate questions');
assert(interview.uncertainty_entropy > 0, 'Uncertainty entropy must be positive');
assert(isfield(interview.knowns, 'plant_type'), 'Failed to identify plant type');

% Test answering question
answers = struct('overshoot_max', 7.5, 'settling_time_target', 0.5, 'u_max', 24.0);
[interview2, ~] = acep_requirements_interview_engine(prompt, answers);
assert(interview2.can_proceed_safely, 'Interview engine should permit proceeding once key specs provided');

% 2. Test Universal Project Spec Compilation
spec = acep_universal_project_spec('electromechanical', 'dc_motor', [], answers);
assert(isfield(spec, 'project_id'), 'Spec missing project_id');
assert(all(size(spec.plant.A) == [2, 2]), 'State matrix A dimension mismatch');

% 3. Test Task Planner DAG Execution
[plan, results] = acep_task_planner(spec, true);
assert(plan.task_count == 8, 'Plan must contain exactly 8 DAG tasks');
assert(strcmp(results.status, 'COMPLETED'), 'Task planner failed execution');
assert(isfield(results, 'final_controller'), 'Missing final controller synthesis');
assert(isfield(results, 'metrics'), 'Missing closed loop performance metrics');
assert(results.lyap_certified == true, 'Lyapunov stability certification failed');

% 4. Test Evidence Validator
valReport = acep_evidence_validator(results);
assert(valReport.summary.total_claims >= 5, 'Evidence validator claims count too low');
assert(valReport.summary.verified_count >= 5, 'Too many unverified claims in report');

% 5. Test Closed-Loop Repair Loop
failedMetrics = struct('overshoot_pct', 25.0, 'settling_time_sec', 1.8);
[repairedCtrl, repairLog] = acep_closed_loop_repair(spec, results.final_controller, failedMetrics);
assert(repairLog.iterations_evaluated > 0, 'Repair loop did not evaluate iterations');
assert(repairLog.final_metrics.overshoot_pct < failedMetrics.overshoot_pct, ...
    'Repair did not improve overshoot');

status = 'PASS';
fprintf('test_engineering_intelligence: PASS (All 5 stages verified successfully)\n');

end
