function [isStable, maxReal] = closed_loop_pole_verification(A_cl)
% CLOSED_LOOP_POLE_VERIFICATION Verifies that all closed-loop eigenvalues lie strictly in LHP
poles = eig(A_cl);
maxReal = max(real(poles));
isStable = (maxReal < -1e-4);
end
