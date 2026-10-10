function predError = controller_performance_predictor(candidateK, plantResidual, estDisturbance)
% CONTROLLER_PERFORMANCE_PREDICTOR Predicts tracking error under estimated disturbance
predError = 0.05 * norm(candidateK) + 0.3 * abs(plantResidual) + 0.2 * abs(estDisturbance);
end
