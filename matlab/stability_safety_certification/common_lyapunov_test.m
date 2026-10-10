function isCommon = common_lyapunov_test(A_list, P)
% COMMON_LYAPUNOV_TEST Verifies existence of common Lyapunov function across switched modes
isCommon = true;
for i = 1:length(A_list)
    A_i = A_list{i};
    if max(real(eig(A_i'*P + P*A_i))) >= 0
        isCommon = false; break;
    end
end
end
