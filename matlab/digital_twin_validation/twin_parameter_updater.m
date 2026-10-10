function twinModel = twin_parameter_updater(twinModel, estimatedParams)
% TWIN_PARAMETER_UPDATER Synchronizes digital twin internal state space matrices
twinModel.A(2, 1) = -estimatedParams(1);
twinModel.A(2, 2) = -estimatedParams(2);
disp('Digital Twin parameter matrices updated via closed-loop identification.');
end
