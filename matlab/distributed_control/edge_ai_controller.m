function u = edge_ai_controller(state)
% EDGE_AI_CONTROLLER Low-latency randomized neural feature mapper for embedded edge controllers
%
% Syntax:
%   u = edge_ai_controller(state)
%
% Inputs:
%   state - Plant state vector observed at edge sensor
%
% Outputs:
%   u     - Localized neural control actuation

    weights = rand(size(state));
    u = weights .* tanh(state);
end
