function text = controller_switch_explainer(dwellTime, margin)
% CONTROLLER_SWITCH_EXPLAINER Explains dwell-time and Lyapunov contraction compliance
text = sprintf('Switch permitted: Dwell time = %.2fs (req >= 0.5s), Lyapunov decay rate = %.2f.', dwellTime, margin);
end
