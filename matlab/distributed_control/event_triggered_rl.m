function [action, triggerFired] = event_triggered_rl(state, lastState, lastAction, delta_td_error, tau_threshold)
% EVENT_TRIGGERED_RL Event-Triggered Reinforcement Learning Policy Evaluation
%
% Invokes deep neural policy actor forward pass only when state innovation or
% Temporal-Difference (TD) error exceeds dynamic resilience threshold tau.

    if nargin < 5
        tau_threshold = 0.25;
    end

    trigger_metric = norm(state - lastState) + abs(delta_td_error);

    if trigger_metric > tau_threshold
        triggerFired = true;
        % Forward pass of Actor network
        action = tanh(0.8 * state);
        disp(['RL Policy Invoked: Innovation = ', num2str(trigger_metric)]);
    else
        triggerFired = false;
        action = lastAction;
    end
end
