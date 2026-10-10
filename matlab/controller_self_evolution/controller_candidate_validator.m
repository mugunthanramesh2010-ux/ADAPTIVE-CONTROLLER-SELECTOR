function isValid = controller_candidate_validator(gains, plant)
% CONTROLLER_CANDIDATE_VALIDATOR Full dynamic validation of chromosome gains
A_cl = plant.A - plant.B * [gains.Kp, gains.Kd];
isValid = all(real(eig(A_cl)) < -0.1);
end
