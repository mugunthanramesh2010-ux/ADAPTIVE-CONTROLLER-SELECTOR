function history = controller_selection_history(history, event)
% CONTROLLER_SELECTION_HISTORY Ring buffer logging all switching events
if isempty(history), history = {}; end
history{end+1} = event;
if length(history) > 100, history(1) = []; end
end
