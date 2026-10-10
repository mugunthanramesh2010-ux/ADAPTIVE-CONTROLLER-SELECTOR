function hypotheses = root_cause_hypothesis_engine(residualNorm, deltaSensor, u_effort)
% ROOT_CAUSE_HYPOTHESIS_ENGINE Evaluates competing hypotheses using Bayesian likelihoods
h1 = struct('Cause', 'Actuator_Degradation', 'Prob', min(0.95, residualNorm * 2.0));
h2 = struct('Cause', 'Sensor_Fault', 'Prob', min(0.90, abs(deltaSensor) * 0.5));
h3 = struct('Cause', 'External_Disturbance', 'Prob', 0.25);
hypotheses = {h1, h2, h3};
end
