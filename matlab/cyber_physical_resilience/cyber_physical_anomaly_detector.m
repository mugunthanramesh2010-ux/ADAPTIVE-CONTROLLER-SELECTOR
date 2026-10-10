function [isAlert, chi2] = cyber_physical_anomaly_detector(innov, Sigma, threshold)
% CYBER_PHYSICAL_ANOMALY_DETECTOR Chi-square hypothesis test on Kalman innovation
if nargin < 3, threshold = 6.635; end % p=0.01 for 1 DOF
chi2 = (innov^2) / Sigma;
isAlert = (chi2 > threshold);
end
