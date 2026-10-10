function isContained = constraint_invariant_set_checker(x, x_bounds)
% CONSTRAINT_INVARIANT_SET_CHECKER Verifies state vector is within invariant safety polytope
isContained = all(x >= x_bounds(:,1)) && all(x <= x_bounds(:,2));
end
