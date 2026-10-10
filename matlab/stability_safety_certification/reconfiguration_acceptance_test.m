function [isAccepted, report] = reconfiguration_acceptance_test(candidateCtrl, plant)
% RECONFIGURATION_ACCEPTANCE_TEST Comprehensive gate check before deploying candidate
A_cl = plant.A - plant.B * [candidateCtrl.Gains(1), candidateCtrl.Gains(2)];
poles = eig(A_cl);
isAccepted = all(real(poles) < -0.2);
report = struct('Candidate', candidateCtrl.Name, 'IsAccepted', isAccepted, 'DecayMargin', abs(max(real(poles))));
end
