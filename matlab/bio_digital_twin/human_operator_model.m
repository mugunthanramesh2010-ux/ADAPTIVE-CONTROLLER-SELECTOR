function operator = human_operator_model(fatigueHours)
% HUMAN_OPERATOR_MODEL Human-in-the-loop psychological & physiological model
    operator.ReactionDelay_ms = 180 + fatigueHours * 25;
    operator.TremorVariance = 0.02 * (1 + 0.1 * fatigueHours);
    disp(['Operator Reaction Delay Modeled: ', num2str(operator.ReactionDelay_ms), ' ms']);
end
