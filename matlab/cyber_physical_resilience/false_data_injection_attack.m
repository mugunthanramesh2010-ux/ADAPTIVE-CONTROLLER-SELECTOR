function y_attack = false_data_injection_attack(y_true, C, attackVector)
% FALSE_DATA_INJECTION_ATTACK Injects vector inside column space to evade simple chi-square checks
y_attack = y_true + C * attackVector;
end
