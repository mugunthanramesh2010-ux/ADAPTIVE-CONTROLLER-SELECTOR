function selectedPop = controller_survival_selection(pop, fitnessScores, numSurvive)
% CONTROLLER_SURVIVAL_SELECTION Tournament survival selection
[~, sortIdx] = sort(fitnessScores, 'ascend');
selectedPop = pop(sortIdx(1:numSurvive));
end
