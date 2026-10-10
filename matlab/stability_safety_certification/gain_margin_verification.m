function gm = gain_margin_verification(plant, K)
% GAIN_MARGIN_VERIFICATION Computes gain margin of loop transfer function
A_cl = plant.A - plant.B * [K(1), K(2)];
poles = eig(A_cl);
gm = 20 * log10(abs(poles(1)) / 1.0); % Decibel estimate
end
