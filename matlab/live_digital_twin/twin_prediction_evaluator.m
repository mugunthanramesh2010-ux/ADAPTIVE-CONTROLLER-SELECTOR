function [rmse, mae] = twin_prediction_evaluator(y_actual, y_pred)
% TWIN_PREDICTION_EVALUATOR Evaluates quantitative prediction quality
rmse = sqrt(mean((y_actual - y_pred).^2));
mae  = mean(abs(y_actual - y_pred));
end
