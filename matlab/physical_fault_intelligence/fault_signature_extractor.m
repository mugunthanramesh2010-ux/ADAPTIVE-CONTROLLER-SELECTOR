function [peakFreq, energy] = fault_signature_extractor(signal, Fs)
% FAULT_SIGNATURE_EXTRACTOR FFT spectral peak identification
N = length(signal);
Y = abs(fft(signal));
f = (0:N/2-1) * (Fs/N);
[energy, maxIdx] = max(Y(1:floor(N/2)));
peakFreq = f(maxIdx);
end
