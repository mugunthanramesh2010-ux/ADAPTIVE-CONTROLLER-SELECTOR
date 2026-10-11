function [u, dTheta] = composite_adaptive_control(e, e_pred, phi)
% COMPOSITE_ADAPTIVE_CONTROL Fast parameter convergence without persistence of excitation
    dTheta = 0.5 * (phi * e + 0.8 * phi * e_pred);
    u = -dTheta * phi;
end
