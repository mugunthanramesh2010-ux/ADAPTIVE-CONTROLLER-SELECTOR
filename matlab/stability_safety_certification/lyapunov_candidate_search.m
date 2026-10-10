function [P, isCertified] = lyapunov_candidate_search(A_cl)
% LYAPUNOV_CANDIDATE_SEARCH Solves Riccati Lyapunov equation A_cl'*P + P*A_cl = -Q
Q = eye(size(A_cl));
try
    P = lyap(A_cl', Q);
    isCertified = all(eig(P) > 0);
catch
    % Analytical solver for 2x2
    M = [2*A_cl(1,1), 2*A_cl(2,1), 0; A_cl(1,2), A_cl(1,1)+A_cl(2,2), A_cl(2,1); 0, 2*A_cl(1,2), 2*A_cl(2,2)];
    rhs = [-Q(1,1); -Q(1,2); -Q(2,2)];
    p_vec = M \ rhs;
    P = [p_vec(1), p_vec(2); p_vec(2), p_vec(3)];
    isCertified = all(eig(P) > 0);
end
end
