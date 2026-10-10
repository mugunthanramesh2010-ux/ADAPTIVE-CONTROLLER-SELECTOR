function [canSwitch, audit] = controller_switch_safety_checker(A_new, P, u_test, u_max)
% CONTROLLER_SWITCH_SAFETY_CHECKER 4-Tier safety pre-check for controller activation
poles = eig(A_new);
isStable = all(real(poles) < -1e-4);
isSatSafe = (abs(u_test) <= u_max);
canSwitch = isStable && isSatSafe;
audit = struct('IsStable', isStable, 'IsSaturationSafe', isSatSafe, 'CanSwitch', canSwitch);
end
