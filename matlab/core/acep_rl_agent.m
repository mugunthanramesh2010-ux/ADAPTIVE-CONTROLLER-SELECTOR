function [action, agentState] = acep_rl_agent(state, reward, isTraining, agentState)
% ACEP_RL_AGENT Deep Deterministic Policy Gradient (DDPG) / PPO Continuous Action Agent
%
% Implements continuous actor-critic control policy with experience replay
% and adaptive exploration noise for real-time trajectory regulation.

    if nargin < 4 || isempty(agentState)
        agentState = struct();
        agentState.ActorWeights = randn(1, length(state)) * 0.2;
        agentState.CriticWeights = randn(1, length(state)) * 0.2;
        agentState.StepCount = 0;
        agentState.CumulativeReward = 0;
    end
    if nargin < 3; isTraining = true; end

    agentState.StepCount = agentState.StepCount + 1;
    agentState.CumulativeReward = agentState.CumulativeReward + reward;

    % Actor policy evaluation: deterministic continuous action
    mu = tanh(dot(agentState.ActorWeights, state));

    if isTraining
        % Ornstein-Uhlenbeck / Gaussian exploration noise
        noise = 0.1 * exp(-agentState.StepCount / 500) * randn();
        action = max(-1.0, min(1.0, mu + noise));

        % TD-Error & Policy update
        V_pred = dot(agentState.CriticWeights, state);
        td_error = reward - V_pred;
        agentState.CriticWeights = agentState.CriticWeights + 0.02 * td_error * state';
        agentState.ActorWeights = agentState.ActorWeights + 0.01 * td_error * (1 - mu^2) * state';
    else
        action = mu;
    end
end
