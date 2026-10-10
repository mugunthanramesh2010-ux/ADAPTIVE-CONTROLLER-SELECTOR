function isStable = multiple_lyapunov_test(V_history, switchTimes)
% MULTIPLE_LYAPUNOV_TEST Checks non-increasing energy at switching instances
isStable = true;
if length(switchTimes) > 1
    for i = 2:length(switchTimes)
        if V_history(switchTimes(i)) > V_history(switchTimes(i-1))
            isStable = false; break;
        end
    end
end
end
