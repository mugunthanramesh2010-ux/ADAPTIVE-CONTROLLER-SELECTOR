function dtwDist = twin_trajectory_comparator(y_p, y_t)
% TWIN_TRAJECTORY_COMPARATOR Computes root mean square discrepancy between trajectories
dtwDist = sqrt(mean((y_p - y_t).^2));
end
