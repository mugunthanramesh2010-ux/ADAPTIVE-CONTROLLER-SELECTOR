function vib = bearing_degradation_simulator(t, rpm, defectSeverity)
% BEARING_DEGRADATION_SIMULATOR Generates characteristic bearing ball-pass frequency defect vibration
f_r = rpm / 60.0;
f_bpfo = 3.58 * f_r; % Ball pass frequency outer race
vib = defectSeverity * (sin(2*pi*f_bpfo*t) + 0.5*sin(4*pi*f_bpfo*t)) .* exp(-mod(t, 1/f_r)*f_r*5);
end
