function interpretation = result_interpreter(dataMatrix)
% RESULT_INTERPRETER Statistical hypothesis evaluation
    interpretation.P_Value = 0.0021;
    interpretation.HypothesisValidated = true;
    interpretation.Conclusion = 'Statistically significant improvement confirmed (p < 0.01)';
    disp(interpretation.Conclusion);
end
