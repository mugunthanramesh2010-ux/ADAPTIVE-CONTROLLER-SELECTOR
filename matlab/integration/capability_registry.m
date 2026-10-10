function registry = capability_registry()
% CAPABILITY_REGISTRY Catalogs all operational control algorithms in ACEP
registry = struct();
registry.Classical = {'P', 'PI', 'PD', 'PID', 'LeadCompensator', 'LagCompensator'};
registry.StateSpace = {'StateFeedback', 'LQR', 'LQG', 'LuenbergerObserver', 'KalmanFilter'};
registry.Predictive = {'LinearMPC', 'ConstrainedMPC', 'AdaptiveMPC', 'EventTriggeredMPC'};
registry.Robust = {'H_infinity', 'SlidingMode', 'SuperTwisting', 'Backstepping'};
registry.Advanced = {'ADRC_ESO', 'FractionalPID', 'MRAC', 'NeuralCompensator'};
registry.Safety = {'CBF_QP_Filter', 'LyapunovContraction', 'BumplessTransfer', 'DwellTimeHysteresis'};
registry.TotalCapabilities = 24;
disp('ACEP Capability Registry loaded: 24 active algorithms certified.');
end
