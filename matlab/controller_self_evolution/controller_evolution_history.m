function hist = controller_evolution_history(hist, gen, bestFit, div)
% CONTROLLER_EVOLUTION_HISTORY Records generational evolutionary progression
if isempty(hist), hist = []; end
hist(end+1, :) = [gen, bestFit, div];
end
