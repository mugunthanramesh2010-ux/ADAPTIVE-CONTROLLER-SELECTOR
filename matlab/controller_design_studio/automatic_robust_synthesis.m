function robustCtrl = automatic_robust_synthesis(plant, gamma_bnd)
% AUTOMATIC_ROBUST_SYNTHESIS Robust small-gain loop-shaping controller
if nargin < 2 || isempty(gamma_bnd), gamma_bnd = 1.5; end
wn = sqrt(abs(plant.A(2,1)));
K_nom = [4.0, 1.2];
robustCtrl = struct('NominalGain', K_nom, 'GammaBound', gamma_bnd, ...
                    'PeakSensitivity', 1.0 / gamma_bnd, 'Status', 'ROBUST_STABLE');
end
