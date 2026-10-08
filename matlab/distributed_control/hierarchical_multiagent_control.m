function action = hierarchical_multiagent_control(leader, followers)
% HIERARCHICAL_MULTIAGENT_CONTROL Two-tier control layer for leader-follower swarm architectures
%
% Syntax:
%   action = hierarchical_multiagent_control(leader, followers)
%
% Inputs:
%   leader    - Leader state vector
%   followers - Matrix of follower states (dimensions: state_dim x num_followers)
%
% Outputs:
%   action    - Control actuation command aligning followers to leader reference

    highLevel = mean(followers, 2);
    lowLevel = leader - highLevel;
    action = lowLevel;
end
