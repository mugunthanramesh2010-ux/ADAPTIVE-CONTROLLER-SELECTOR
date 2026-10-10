function scenario = scenario_manager(scenarioType)
% SCENARIO_MANAGER Generates test profiles for FDI, Replay, DoS, and actuator degradation
switch upper(scenarioType)
    case 'FDI'
        scenario = struct('Type', 'False Data Injection', 'Magnitude', 50.0, 'StartTime', 2.0, 'Duration', 0.2);
    case 'REPLAY'
        scenario = struct('Type', 'Sensor Replay Attack', 'LagSteps', 50, 'StartTime', 2.5, 'Duration', 0.5);
    case 'ACTUATOR_FAULT'
        scenario = struct('Type', '40% Loss of Actuator Effectiveness', 'Health', 0.6, 'StartTime', 3.0);
    otherwise
        scenario = struct('Type', 'Nominal', 'Health', 1.0);
end
end
