function expDesign = experiment_designer(hypothesis)
% EXPERIMENT_DESIGNER Configures automated testing matrices
    expDesign.Trials = 500;
    expDesign.Variables = {'WindSpeed', 'ActuatorWear', 'SensorDelay'};
    expDesign.Metrics = {'ITAE', 'PeakOvershoot', 'RobustStabilityMargin'};
    disp('Experiment Design Matrix Initialized');
end
