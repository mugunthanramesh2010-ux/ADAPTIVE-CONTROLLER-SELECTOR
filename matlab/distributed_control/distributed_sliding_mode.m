function u = distributed_sliding_mode(e, de)
% DISTRIBUTED_SLIDING_MODE Distributed Sliding Mode Control with Boundary Layer
%
% Syntax:
%   u = distributed_sliding_mode(e, de)
%
% Inputs:
%   e  - Tracking error vector
%   de - Derivative of tracking error
%
% Outputs:
%   u  - Discontinuous / boundary sliding control signal

    lambda = 5;          % Sliding surface slope
    s = de + lambda * e; % Sliding manifold s(t)
    K = 10;              % Discontinuous switching gain

    % Sliding mode switching control
    u = -K * sign(s);
end
