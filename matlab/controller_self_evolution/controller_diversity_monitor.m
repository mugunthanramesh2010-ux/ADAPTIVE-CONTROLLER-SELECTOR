function divScore = controller_diversity_monitor(pop)
% CONTROLLER_DIVERSITY_MONITOR Computes pairwise Euclidean genetic diversity
N = length(pop);
totalDist = 0; count = 0;
for i = 1:N
    for j = (i+1):N
        totalDist = totalDist + norm(pop{i} - pop{j});
        count = count + 1;
    end
end
divScore = totalDist / max(1, count);
end
