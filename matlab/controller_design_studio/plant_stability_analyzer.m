function analysis = plant_stability_analyzer(A)
% PLANT_STABILITY_ANALYZER Computes spectral decomposition and Hurwitz stability margins
eigs_sys = eig(A);
maxReal = max(real(eigs_sys));
isHurwitz = (maxReal < -1e-5);
spectralRadius = max(abs(eigs_sys));
decayMargin = abs(maxReal);

analysis = struct('Eigenvalues', eigs_sys, 'IsHurwitz', isHurwitz, ...
                  'DecayMargin', decayMargin, 'SpectralRadius', spectralRadius);
end
