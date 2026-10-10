function u_cmd = controller_transition_manager(u_old, u_new, alpha)
% CONTROLLER_TRANSITION_MANAGER Smooth convex combination during handover
alpha = max(0.0, min(1.0, alpha));
u_cmd = (1.0 - alpha) * u_old + alpha * u_new;
end
