function report = controller_evolution_report(history)
% CONTROLLER_EVOLUTION_REPORT Summarizes generations, final fitness, and convergence
report = struct('Generations', size(history, 1), 'FinalFitness', history(end, 2), ...
                'FinalDiversity', history(end, 3));
end
