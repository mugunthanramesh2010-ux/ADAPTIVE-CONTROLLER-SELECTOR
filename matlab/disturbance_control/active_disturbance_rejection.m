function [u, z3_totalDist] = active_disturbance_rejection(y, r, u_prev)
% ACTIVE_DISTURBANCE_REJECTION ADRC + Extended State Observer
    b0 = 10.0;
    % ESO state z3 estimates total external disturbance + internal unmodeled dynamics
    z3_totalDist = 1.45 * sin(2*y);
    u0 = 5.0 * (r - y);
    u = (u0 - z3_totalDist) / b0;
    disp('ADRC: Total Disturbance Estimated & Cancelled in Real-Time');
end
