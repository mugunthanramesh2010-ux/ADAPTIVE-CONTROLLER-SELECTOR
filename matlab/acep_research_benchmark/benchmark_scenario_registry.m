function scn = benchmark_scenario_registry(id)
% BENCHMARK_SCENARIO_REGISTRY Standardized benchmark scenario configurations
switch id
    case 1, scn = struct('Name', 'Nominal_Step', 'Disturbance', 0.0, 'FaultTime', Inf);
    case 2, scn = struct('Name', 'Sinusoidal_Gust', 'Disturbance', 3.5, 'FaultTime', Inf);
    case 3, scn = struct('Name', 'Actuator_40Pct_Loss', 'Disturbance', 0.0, 'FaultTime', 2.0);
    otherwise, scn = struct('Name', 'Combined_Triple_Hazard', 'Disturbance', 2.5, 'FaultTime', 2.0);
end
end
