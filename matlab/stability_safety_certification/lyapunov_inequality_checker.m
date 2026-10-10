function [isSatisfied, decayRate] = lyapunov_inequality_checker(A_cl, P)
% LYAPUNOV_INEQUALITY_CHECKER Checks derivative inequality V_dot <= -alpha * V
V_dot_mat = A_cl' * P + P * A_cl;
maxEig = max(real(eig(V_dot_mat)));
isSatisfied = (maxEig < 0);
decayRate = abs(max(real(eig(A_cl))));
end
