function isIdentical = reproducibility_check(run1, run2)
% REPRODUCIBILITY_CHECK Verifies that deterministic runs produce identical numerical results
diffNorm = norm(run1.y - run2.y);
isIdentical = (diffNorm < 1e-10);
end
