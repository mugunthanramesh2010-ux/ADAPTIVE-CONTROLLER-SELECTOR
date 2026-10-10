function normVal = attack_residual_analyzer(y_meas, y_pred)
% ATTACK_RESIDUAL_ANALYZER Computes Euclidean residual norm
normVal = norm(y_meas - y_pred);
end
