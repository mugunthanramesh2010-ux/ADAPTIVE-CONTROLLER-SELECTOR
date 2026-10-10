function twinModel = twin_parameter_synchronizer(twinModel, rlsTheta)
% TWIN_PARAMETER_SYNCHRONIZER Updates internal twin state-space matrices from RLS estimates
twinModel.A(2,1) = -rlsTheta(1);
twinModel.A(2,2) = -rlsTheta(2);
end
