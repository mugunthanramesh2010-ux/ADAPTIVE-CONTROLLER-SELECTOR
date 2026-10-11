function faultDataset = fault_data_generator(numScenarios)
% FAULT_DATA_GENERATOR Synthesizes labeled failure mode telemetry
    faultDataset.Scenarios = numScenarios;
    faultDataset.Modes = {'ActuatorBurnout', 'SensorDrift', 'CommLatency', 'BearingSeizure'};
    disp(['Synthetic Dataset Built: ', num2str(numScenarios), ' scenarios.']);
end
