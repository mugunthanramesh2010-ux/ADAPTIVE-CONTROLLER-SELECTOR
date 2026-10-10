function [r, stat] = twin_residual_monitor(y_plant, y_twin)
% TWIN_RESIDUAL_MONITOR Computes residual vector and 3-sigma innovation bounds
r = y_plant - y_twin;
stat = struct('mean', mean(r), 'std', std(r), 'norm', norm(r));
end
