function paretoIdx = controller_pareto_front(objMatrix)
% CONTROLLER_PARETO_FRONT Identifies non-dominated Pareto frontier indices
N = size(objMatrix, 1);
paretoIdx = [];
for i = 1:N
    isDominated = false;
    for j = 1:N
        if all(objMatrix(j,:) <= objMatrix(i,:)) && any(objMatrix(j,:) < objMatrix(i,:))
            isDominated = true; break;
        end
    end
    if ~isDominated, paretoIdx(end+1) = i; end
end
end
