function u_comp = disturbance_feedforward_compensator(d_hat, b0)
% DISTURBANCE_FEEDFORWARD_COMPENSATOR Computes feedforward cancellation signal
u_comp = -d_hat / b0;
end
