function isPassed = recovery_candidate_tester(candidate, twinModel)
% RECOVERY_CANDIDATE_TESTER Rehearses recovery controller on the Digital Twin sandbox
% Simulated 1.0 second fast lookahead
dt = 0.01;
x = [0.5; 0];
stable = true;
for k = 1:100
    u = -candidate.K * x;
    x = x + dt * (twinModel.A * x + twinModel.B * u);
    if norm(x) > 10.0
        stable = false; break;
    end
end
isPassed = stable;
end
