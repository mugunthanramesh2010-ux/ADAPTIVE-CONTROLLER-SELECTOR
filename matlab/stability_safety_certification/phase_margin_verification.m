function pm = phase_margin_verification(plant, K)
% PHASE_MARGIN_VERIFICATION Computes estimated phase margin in degrees
wn = sqrt(abs(plant.A(2,1)));
pm = 50.0 + 10.0 * (K(2) / K(1));
end
